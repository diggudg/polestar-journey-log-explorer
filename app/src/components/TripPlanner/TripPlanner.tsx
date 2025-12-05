import { Alert, Badge, Grid, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconChargingPile, IconClock, IconMapPin, IconRoute } from '@tabler/icons-react';
import { useState } from 'react';
import TripForm from './TripForm';
import TripMap from './TripMap';

interface Waypoint {
  lat: number;
  lon: number;
  label: string;
  type: 'charger' | 'stop';
}

export default function TripPlanner() {
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tripStats, setTripStats] = useState<{
    distance: number;
    duration: string;
    consumption: number;
    cost: number;
    arrivalSoc: number;
    chargingTime: number;
  } | null>(null);

  const BATTERY_CAPACITY = 78; // kWh

  const [currency, setCurrency] = useState('USD');

  const handlePlanTrip = async (
    startArg: [number, number],
    endArg: [number, number],
    currentSoc: number,
    targetSoc: number,
    avgConsumption: number,
    selectedCurrency: string,
    homeRate: number,
    publicRate: number
  ) => {
    // e.preventDefault(); // Not an event anymore
    if (!startArg || !endArg) return;

    setLoading(true);
    setError(null);
    setStartCoords(startArg);
    setEndCoords(endArg);
    setWaypoints([]); 
    setCurrency(selectedCurrency);

    try {
      // --- Iterative Route Calculation ---
      // We perform a simulation: Start -> Drive until low SOC -> Find Charger -> Charge -> Repeat
      
      let currentLoc = startArg; // [lon, lat]
      let currentSocState = currentSoc; // Start with user's current SOC
      const finalDest = endArg; // [lon, lat]
      
      const collectedWaypoints: Waypoint[] = [];
      const MAX_STOPS = 5; // Safety break
      let reached = false;

      // We need to keep track of the journey segments to build the final route
      // Actually, standard OSRM can take multiple waypoints. 
      // So we just need to collect the chargers, then do one final big route request.
      
      for (let i = 0; i < MAX_STOPS; i++) {
        // 1. Calculate route from Current Location to Final Destination
        // currentLoc is [Lat, Lon]. OSRM needs Lon,Lat.
        const legUrl = `https://router.project-osrm.org/route/v1/driving/${currentLoc[1]},${currentLoc[0]};${finalDest[1]},${finalDest[0]}?overview=full&geometries=geojson`;
        const legRes = await fetch(legUrl);
        const legData = await legRes.json();
        
        if (!legData.routes || legData.routes.length === 0) {
            throw new Error('Could not find route segment.');
        }

        const route = legData.routes[0];
        const distanceKm = route.distance / 1000;
        const coords = route.geometry.coordinates; // OSRM returns [lon, lat][]

        // 2. Check Range
        // User Requirement: Must reach point with >= 10% battery.
        // We use 10% as the HARD LIMIT.
        const availableEnergyKwh = (currentSocState / 100) * BATTERY_CAPACITY;
        const hardReserveKwh = 0.10 * BATTERY_CAPACITY; // 10% hard stop
        
        // We search slightly before the hard limit to find a charger comfortably
        // Search trigger: 12.5% SOC.
        const searchTriggerKwh = 0.125 * BATTERY_CAPACITY; 
        
        const usableToHardLimitKwh = availableEnergyKwh - hardReserveKwh;
        const usableToSearchKwh = availableEnergyKwh - searchTriggerKwh;
        
        const maxHardRangeKm = Math.max(0, (usableToHardLimitKwh / avgConsumption) * 100);
        const searchRangeKm = Math.max(0, (usableToSearchKwh / avgConsumption) * 100);

        if (distanceKm <= maxHardRangeKm) {
            // We can reach the destination with > 10% SOC!
            reached = true;
            break;
        }

        // 3. We can't reach. Find a stop near searchRangeKm (12.5% SOC point).
        let distAccum = 0;
        let pSearch = null;

        for (let j = 0; j < coords.length - 1; j++) {
            const p1 = coords[j];
            const p2 = coords[j+1];
            // Haversine
            const R = 6371;
            const dLat = (p2[1] - p1[1]) * Math.PI / 180;
            const dLon = (p2[0] - p1[0]) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const d = R * c;
            
            distAccum += d;
            if (distAccum >= searchRangeKm) {
                pSearch = p2; // p2 is [lon, lat] from OSRM
                break;
            }
        }
        
        const searchCenter = pSearch || coords[coords.length - 1]; // [lon, lat]

        // 4. Find Charger
        // Search Radius: 5000m around the safe search point. 
        // Overpass expects (around:radius, lat, lon).
        // searchCenter is [lon, lat]. So searchCenter[1] is Lat.
        
        const overpassQuery = `[out:json][timeout:25];nwr["amenity"="charging_station"](around:5000,${searchCenter[1]},${searchCenter[0]});out center;`;
        const params = new URLSearchParams();
        params.append('data', overpassQuery);

        // Slow down slightly to be nice to API? 
        // In client-side logic, sequential awaits are usually slow enough.
        // Update: User hitting 429. Need explicit delay.
        await new Promise(r => setTimeout(r, 2000)); // 2s delay

        let opRes;
        let retries = 3;
        while (retries > 0) {
            try {
                opRes = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    body: params,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                
                if (opRes.status === 429) {
                    console.warn('Overpass rate limit hit, backing off...');
                    await new Promise(r => setTimeout(r, 5000)); // 5s backoff
                    retries--;
                    continue;
                }
                
                if (!opRes.ok) throw new Error('Overpass API error');
                break; // Success
            } catch (e) {
                console.warn('Overpass fetch failed', e);
                if (retries === 1) throw e;
                retries--;
                await new Promise(r => setTimeout(r, 2000));
            }
        }
        
        if (!opRes || !opRes.ok) throw new Error('Failed to fetch from Overpass after retries');
        
        const opData = await opRes.json();
        let bestCharger = null;

        if (opData.elements && opData.elements.length > 0) {
            // Pick the first good one.
            const el = opData.elements[0];
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            if (lat && lon) {
                bestCharger = { lat, lon, name: el.tags?.name || 'Charging Station' };
            }
        }

        if (bestCharger) {
            collectedWaypoints.push({
                lat: bestCharger.lat,
                lon: bestCharger.lon,
                label: bestCharger.name,
                type: 'charger'
            });
            
            // Critical: Update currentLoc to [Lat, Lon] to match startArg format for next iteration OSRM call.
            currentLoc = [bestCharger.lat, bestCharger.lon]; 
            currentSocState = 80; // Charge to 80% at intermediate stops
        } else {
             // Fallback: Add phantom stop at search center
             // searchCenter is [lon, lat]
             collectedWaypoints.push({
                 lat: searchCenter[1],
                 lon: searchCenter[0],
                 label: 'Planned Stop (No Charger)',
                 type: 'charger'
             });
             // Update currentLoc to [Lat, Lon]
             currentLoc = [searchCenter[1], searchCenter[0]];
             currentSocState = 80;
        }
      }

      // If loop finishes without reached=true, we might have hit max stops.
      
      // 5. Final Full Route Calculation
      // Construct URL: start -> wp1 -> wp2 -> ... -> end
      // startArg, endArg are [Lat, Lon]. URL needs Lon,Lat.
      const waypointsStr = collectedWaypoints.map(wp => `${wp.lon},${wp.lat}`).join(';');
      const fullUrl = `https://router.project-osrm.org/route/v1/driving/${startArg[1]},${startArg[0]};${waypointsStr ? waypointsStr + ';' : ''}${endArg[1]},${endArg[0]}?overview=full&geometries=geojson`;
      
      const finalRes = await fetch(fullUrl);
      const finalData = await finalRes.json();
      
      if (!finalData.routes || finalData.routes.length === 0) {
          throw new Error('Failed to calculate final route.');
      }

      const finalRoute = finalData.routes[0];
      setRouteGeometry(finalRoute.geometry.coordinates);
      setWaypoints(collectedWaypoints); // Update map markers

      // 6. Calculate Stats (Cost, Duration with Charging)
      // We iterate through legs to calculate cost and charging time accurately.
      
      const totalTimeSec = finalRoute.duration;
      const totalDistKm = finalRoute.distance / 1000;
      let totalEstCost = 0;
      let totalChargingTimeSec = 0;
      
      // Legs:
      // Leg 0: Start -> Stop 1
      // Leg 1: Stop 1 -> Stop 2
      // ...
      // Leg N: Stop N -> End
      
      // We need to track SOC state through the legs again to calculate specific charge needs.
      const simSoc = currentSoc; 
      
      // We need to know "Target SOC" for *final arrival*.
      // Intermediate arrivals just need > 10%.
      // We charge up to *what is needed* for next leg + buffer? Or up to 80% fixed?
      // Logic:
      //  - At Start: we use Home Rate.
      //  - At Chargers: we use Public Rate.
      //  - We charge enough to reach next stop with >10% buffer.
      //  - At last charger: we charge enough to reach Dest with Target% buffer.
      
      const legs = finalRoute.legs; 
      
      // Iterating costs
      // Energy used in Leg i comes from battery. 
      // If we are at Start (i=0), that energy was "Home Energy".
      // If we are at Charger (i>0), we must have charged it there.
      
      // Simplified Cost Model:
      // Calculate Total Consumption.
      // Calculate how much *must* have been added by Public Chargers.
      // Remainder is Home Energy.
      
      // Let's refine public charging calc:
      // At Stop i (which is end of Leg i, start of Leg i+1):
      //  Arrive with SOC_arr.
      //  Next Leg needs E_next.
      //  We target departure SOC_dep such that (SOC_dep -> drive -> SOC_next_arr >= 10% or Target%).
      //  Charge = SOC_dep - SOC_arr.
      
      let currentEnergy = (simSoc / 100) * BATTERY_CAPACITY;
      
      // Accumulate costs and time
      for (let i = 0; i < legs.length; i++) {
         const leg = legs[i];
         const legDist = leg.distance / 1000;
         const legCons = (legDist * avgConsumption) / 100;
         
         // Driver consumes energy
         currentEnergy -= legCons;
         
         // Check if this is the last leg (End of this leg is Destination)
         const isLastLeg = (i === legs.length - 1);
         
         if (!isLastLeg) {
             // We are at a charger (Waypoints[i]).
             // Determine needed energy for *next* leg (Leg i+1)
             const nextLeg = legs[i+1];
             const nextDist = nextLeg.distance / 1000;
             const nextCons = (nextDist * avgConsumption) / 100;
             
             // If next is REAL destination, we need to arrive with TargetSOC.
             // If next is just another charger, we need to arrive with safe buffer (10%).
             const isNextDest = (i+1 === legs.length - 1);
             const bufferPercent = isNextDest ? targetSoc : 10;
             
             const requiredBuffer = (bufferPercent / 100) * BATTERY_CAPACITY;
             const requiredDeparture = nextCons + requiredBuffer;
             
             // Do we have enough? probably not, or we wouldn't have stopped (in ideal world).
             // But valid check.
             if (currentEnergy < requiredDeparture) {
                 const deficit = requiredDeparture - currentEnergy;
                 
                 // Charge what is needed
                 // Cap at 100% capacity just in case
                 const maxCharge = BATTERY_CAPACITY - currentEnergy;
                 const actualCharge = Math.min(deficit, maxCharge);
                 
                 const chargeTimeHours = actualCharge / 100; // 100kW avg speed
                 totalChargingTimeSec += (chargeTimeHours * 3600);
                 
                 totalEstCost += actualCharge * publicRate;
                 currentEnergy += actualCharge;
             }
         }
      }
      
      // Finally, cost of energy that we *started* with (Home Energy)
      // Total Used = TotalConsumption.
      // Total Added Public = sum(actualCharge).
      // Home Energy Used = TotalUsed - TotalAddedPublic.
      // Wait, simpler:
      // Users pays for *Initial Full Charge* (relative to use) or just *Used*?
      // "Est. Cost" usually means trip specific cost.
      // Cost = (Public Charged kWh * Public Rate) + (Home Charged kWh * Home Rate)
      // Home Charged kWh = Total Consumption - Public Charged kWh.
      // (Assuming we end up with TargetSOC, technically we "used" the difference between StartSOC and TargetSOC too, 
      // but let's stick to consumption-based cost).
      
      // Actually tracking "Home Energy" is tricky if we end up with LESS charge than we started.
      // Let's assume Cost = (TotalkWhConsumed - PublicAddedkWh) * HomeRate + (PublicAddedkWh * PublicRate).
      // This is fair.
      
      const totalConsKwh = (totalDistKm * avgConsumption) / 100;
      const publicChargedKwh = totalEstCost / (publicRate || 1); // Reverse eng if rate > 0
      // Better to track public kwh directly
      // Let's re-sum quickly in loop above? 
      // Nah, just reuse the logic implied:
      // The `totalEstCost` computed above IS the Public Cost. 
      // We just need the kWh count to subtract from total.
      
      const publicKwh = (totalEstCost > 0 && publicRate > 0) ? totalEstCost / publicRate : 0;
      const homeKwh = Math.max(0, totalConsKwh - publicKwh);
      const finalTotalCost = totalEstCost + (homeKwh * homeRate);

      // Final Arrival SOC
      // CurrentEnergy is what we have after driving the last leg.
      // It should match TargetSOC theoretically if logic is sound.
      const finalArrivalSoc = (currentEnergy / BATTERY_CAPACITY) * 100; 

      const hours = Math.floor((totalTimeSec + totalChargingTimeSec) / 3600);
      const minutes = Math.floor(((totalTimeSec + totalChargingTimeSec) % 3600) / 60);

      setTripStats({
        distance: totalDistKm,
        duration: `${hours}h ${minutes}m`,
        consumption: totalConsKwh,
        cost: finalTotalCost,
        arrivalSoc: finalArrivalSoc,
        chargingTime: Math.ceil(totalChargingTimeSec / 60)
      });

    } catch (err) {
      console.error(err);
      setError('Could not calculate trip. Please check locations.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Stack gap="lg" h="100%">
      <Title order={2}>Trip Planner</Title>
      
      {error && (
        <Alert icon={<IconAlertTriangle size={16}/>} title="Error" color="red">
          {error}
        </Alert>
      )}

      <Grid h="100%">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <TripForm onPlanTrip={handlePlanTrip} loading={loading} />
            
            {tripStats && (
              <Paper p="md" withBorder radius="md">
                  <Title order={4} mb="md">Trip Estimate</Title>
                  <Stack gap="xs">
                      <Group justify="space-between">
                          <Group gap="xs">
                              <IconRoute size={18} color="gray"/>
                              <Text size="sm">Distance</Text>
                          </Group>
                          <Text fw={700}>{tripStats.distance.toFixed(1)} km</Text>
                      </Group>
                      <Group justify="space-between">
                          <Group gap="xs">
                              <IconClock size={18} color="gray"/>
                              <Text size="sm">Duration</Text>
                          </Group>
                          <Text fw={700}>{tripStats.duration}</Text>
                      </Group>
                      <Group justify="space-between">
                          <Group gap="xs">
                              <IconChargingPile size={18} color="gray"/>
                              <Text size="sm">Est. Cost</Text>
                          </Group>
                          <Text fw={700}>{tripStats.cost.toFixed(2)} {currency}</Text>
                      </Group>
                      
                      <Grid mt="sm">
                          <Grid.Col span={6}>
                              <Paper withBorder p="xs" radius="md" bg="var(--mantine-color-gray-0)">
                                  <Text size="xs" c="dimmed">Arrival SOC</Text>
                                  <Text 
                                    fw={700} 
                                    size="lg" 
                                    c={tripStats.arrivalSoc < 10 ? 'red' : 'green'}
                                  >
                                      {tripStats.arrivalSoc.toFixed(0)}%
                                  </Text>
                              </Paper>
                          </Grid.Col>
                          <Grid.Col span={6}>
                              <Paper withBorder p="xs" radius="md" bg="var(--mantine-color-gray-0)">
                                  <Text size="xs" c="dimmed">Charge Time</Text>
                                  <Text fw={700} size="lg">
                                      {tripStats.chargingTime > 0 ? `${tripStats.chargingTime}m` : '-'}
                                  </Text>
                              </Paper>
                          </Grid.Col>
                      </Grid>

                      {tripStats.chargingTime > 0 && (
                          <Alert color="orange" title="Charging Needed" mt="xs" icon={<IconAlertTriangle size={16}/>}>
                              You need to charge for approx {tripStats.chargingTime} minutes to reach your target SOC.
                          </Alert>
                      )}
                  </Stack>
              </Paper>
            )}
          </Stack>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper withBorder radius="md" h={600} style={{ overflow: 'hidden' }}>
                {/* Re-render map when start/end changes to reset view properly if needed, 
                    though useEffect in TripMap handles it. */}
                <TripMap 
                    start={startCoords} 
                    end={endCoords} 
                    routeGeometry={routeGeometry}
                    waypoints={waypoints}
                />
            </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
