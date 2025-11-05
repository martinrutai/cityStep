import React, { createContext, useContext, useEffect, useState } from 'react';
import initialUser from './user';

const UserContext = createContext();

//NIGGA RUTAI MAS TU PRIPRAVENY KOD NA DATABAZU TAK TO LEN PREPOJ A SPOJAZDNI
// DATABASE
// const API_URL = 'http://localhost:8081';

export function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [buildings, setBuildings] = useState([]); 

  /* DATABASE
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/buildings`);
        if (!response.ok) throw new Error('Failed to load buildings');
        const data = await response.json();
        
        // Convert backend format to frontend format
        const loadedBuildings = data.map(b => ({
          id: b.id,
          lat: b.lat,
          lng: b.lng,
          level: b.level,
          income: b.income,
          upgradeCost: b.upgrade_cost
        }));
        
        setBuildings(loadedBuildings);
      } catch (err) {
        console.error('Error loading buildings:', err);
      }
    };

    if (user.id) {
      loadBuildings();
    }
  }, [user.id]);
  */

  const deductMoney = (amount) => {
    /* DATABASE
    const newMoney = Math.max(user.money - amount, 0);
    try {
      await fetch(`${API_URL}/users/${user.id}/money`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ money: newMoney })
      });
    } catch (err) {
      console.error('Error updating money:', err);
    }
    */
    setUser((prevUser) => ({
      ...prevUser,
      money: Math.max(prevUser.money - amount, 0),
    }));
  };

  const addMoney = (amount) => {
    /* DATABASE
    const newMoney = user.money + amount;
    try {
      await fetch(`${API_URL}/users/${user.id}/money`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ money: newMoney })
      });
    } catch (err) {
      console.error('Error updating money:', err);
    }
    */
    setUser((prevUser) => ({
      ...prevUser,
      money: prevUser.money + amount,
    }));
  };

  const addBuilding = (building) => {
    /* DATABASE
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: building.lat,
          lng: building.lng,
          level: building.level,
          income: building.income,
          upgradeCost: building.upgradeCost
        })
      });

      if (!response.ok) throw new Error('Failed to save building');
      const savedBuilding = await response.json();
      building.id = savedBuilding.id;
    } catch (err) {
      console.error('Error saving building:', err);
    }
    */
    setBuildings((prev) => [...prev, building]);
  };

  const removeBuilding = (id) => {
    /* DATABASE: Uncomment to delete building from database
    try {
      await fetch(`${API_URL}/users/${user.id}/buildings/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting building:', err);
    }
    */
    setBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBuilding = (id, updates) => {
    /* DATABASE
    try {
      await fetch(`${API_URL}/users/${user.id}/buildings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Error updating building:', err);
    }
    */
    setBuildings(prev => prev.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (buildings.length === 0) return;

      const totalIncome = buildings.reduce((sum, b) => sum + b.income, 0);
      addMoney(totalIncome);
    }, 5000);

    return () => clearInterval(interval);
  }, [buildings]);

  const value = {
    user,
    buildings,
    addBuilding,
    removeBuilding,
    updateBuilding,
    deductMoney,
    addMoney,
    setBuildings,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
