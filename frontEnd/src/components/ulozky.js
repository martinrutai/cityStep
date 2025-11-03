// ulozky.js
import React from 'react';

// ✅ Utility: Haversine formula to get distance in meters
function getDistanceOnEarth(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000; // meters
}

// ✅ Main function: generates a list of potential "tasks" for a given building
function getTaskForBuilding(building, buildings) {
  const categories = [
    // [minDistance, maxDistance, minMoney, maxMoney]
    [50, 200, 120, 200], // short distance
    [200, 1000, 200, 400], // medium
    [1000, 3500, 400, 800], // long
    [3500, 15000, 800, 1600], // very long
  ];

  // Categorize other buildings by distance
  const categorized = buildings.reduce(
    (acc, cur) => {
      if (cur.id === building.id) return acc; // skip self
      const distance = 100 + getDistanceOnEarth(building.lat, building.lng, cur.lat, cur.lng);
      for (let i = 0; i < categories.length; i++) {
        if (distance >= categories[i][0] && distance < categories[i][1]) {
          acc[i].push([cur, distance]);
          break;
        }
      }
      return acc;
    },
    [[], [], [], []]
  );

  // Create one random task per category (if possible)
  const tasks = [];
  for (let i = 0; i < categorized.length; i++) {
    if (categorized[i].length > 0) {
      const index = Math.floor(Math.random() * categorized[i].length);
      const [goal, distance] = categorized[i][index];

      // reward scaling based on distance
      const x = (distance - categories[i][0]) / (categories[i][1] - categories[i][0]);
      let money =
        (3 - 2 * x) * x * x * (categories[i][3] - categories[i][2]) +
        categories[i][2];
      money *= 0.9 + Math.random() * 0.2; // randomize ±10%

      tasks.push({
        goalId: goal.id,
        goalName: goal.name ?? "Building " + goal.id,
        reward: Math.round(money),
        distance: Math.round(distance),
      });
    }
  }

  return tasks;
}

// ✅ Optional wrapper — can be expanded to manage or store tasks
function ulozky(buildings) {
  let allTasks = [];
  for (const building of buildings) {
    const tasks = getTaskForBuilding(building, buildings);
    allTasks = allTasks.concat(tasks.map((t) => ({ fromId: building.id, ...t })));
  }
  return allTasks;
}

export default ulozky;
export { getTaskForBuilding, getDistanceOnEarth };
