import React, { createContext, useContext, useEffect, useState } from 'react';
import initialUser from './user';


const UserContext = createContext();

const API_URL = 'http://localhost:8081';

export function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [buildings, setBuildings] = useState([]); 

  const login = async (name) => {
    try {
      console.log(name)
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',                 // POST for sending data
        headers: {
          'Content-Type': 'application/json'  // tell server it’s JSON
        },
        body: JSON.stringify({ name })  // send the name in the body
      });
      if (!response.ok) throw new Error('User not found');
      const data = await response.json();

      console.log(data)
      if (data.length === 0) {
        alert("No user with that name");
        return;
      }
      setUser(data[0]); // assuming the first match
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    }
  };

  useEffect(() => {
    if (user)
    {
      const loadBuildings = async () => {
        try {
          const response = await fetch(`${API_URL}/users/${user.id}/buildings`);
          if (!response.ok) throw new Error('Failed to load db, riadok 19 v context user');
          const data = await response.json();
          // Convert backend format to frontend format
          const loadedBuildings = data.map(b => {
            return {
              id: b.id,
              lat: b.lat,
              lng: b.lng,
              level: b.level,
              income: b.income,
              upgradeCost: b.upgrade_cost
            }
          });
        } catch (err) {
          console.error('Error loading buildings:', err);
        }
      };
  
      if (user.id) {
        loadBuildings();
      }
    }
  }, [user.id]);
  
  const addBuilding = async (building) => {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building: {
            lat: building.lat,
            lng: building.lng,
            level: building.level,
            income: building.income,
            upgradeCost: building.upgradeCost,
            name: "markus"
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save building');
      const savedBuilding = await response.json();
      building.id = savedBuilding.id;
    } catch (err) {
      console.error('Error saving building:', err);
    }
    setBuildings((prev) => [...prev, building]);
  };

  const deductMoney = async (amount) => {
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
    setUser((prevUser) => ({
      ...prevUser,
      money: Math.max(prevUser.money - amount, 0),
    }));
  };

  const addMoney = async (amount) => {
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
    setUser((prevUser) => ({
      ...prevUser,
      money: prevUser.money + amount,
    }));
  };

  const removeBuilding = async (id) => {
    try {
      await fetch(`${API_URL}/users/${user.id}/buildings/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting building:', err);
    }
    setBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBuilding = async (id, updates) => {
    try {
      await fetch(`${API_URL}/users/${user.id}/buildings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Error updating building:', err);
    }
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
    login,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
