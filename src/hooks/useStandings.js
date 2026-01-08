import { useMemo } from 'react';

export const useStandings = (drivers) => {
  return useMemo(() => {
    // 1. Calculate WDC (Drivers)
    const sortedDrivers = [...drivers].sort((a, b) => b.points - a.points);

    // 2. Calculate WCC (Constructors) - Official FIA Logic
    const teamMap = {};

    drivers.forEach(driver => {
      const teamName = driver.team.toUpperCase().trim();
      if (!teamMap[teamName]) {
        teamMap[teamName] = {
          name: teamName,
          points: 0,
          driverCount: 0
        };
      }
      teamMap[teamName].points += Number(driver.points);
      teamMap[teamName].driverCount += 1;
    });

    // Convert map to array and sort by total points
    const constructorStandings = Object.values(teamMap).sort((a, b) => b.points - a.points);

    return { sortedDrivers, constructorStandings };
  }, [drivers]);
};