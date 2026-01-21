import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/U01_Login';
import Welcome from './components/U10_Welcome';
import ExerciseCards from './components/U11_ExerciseCards';
import Celebration from './components/U13_Celebration';
import ConditionInput from './components/U14_ConditionInput';
import BulkRecord from './components/U15_BulkRecord';
import BulkRecord2 from './components/U15_BulkRecord2';
import Home from './components/U02_Home';
import ExerciseMenu from './components/U03_ExerciseMenu';
import ExerciseSession from './components/U04_ExerciseSession';
import History from './components/U07_History';
import Measurements from './components/U08_Measurements';
import PasswordReset from './components/U09_PasswordReset';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/exercise-cards" element={<ExerciseCards />} />
          <Route path="/celebration" element={<Celebration />} />
          <Route path="/home" element={<Home />} />
          <Route path="/exercise-menu" element={<ExerciseMenu />} />
          <Route path="/exercise-session/:id" element={<ExerciseSession />} />
          <Route path="/history" element={<History />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/condition-input" element={<ConditionInput />} />
          <Route path="/bulk-record" element={<BulkRecord />} />
          <Route path="/bulk-record2" element={<BulkRecord2 />} />
        </Routes>
      </div>
    </Router>
  );
}