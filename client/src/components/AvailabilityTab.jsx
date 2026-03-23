import { useState } from 'react';
import Calendar from 'react-calendar';
import { toast } from 'react-hot-toast';
import { updateMyProviderProfileAPI } from '../api/providers';

const toDateString = (date) => new Date(date).toLocaleDateString('en-CA');

const AvailabilityTab = ({ profile, onProfileUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState({
      morningCapacity: profile.morningCapacity || 1,
      eveningCapacity: profile.eveningCapacity || 1,
      morningStartTime: profile.morningStartTime || '09:00',
      morningEndTime: profile.morningEndTime || '12:00',
      eveningStartTime: profile.eveningStartTime || '14:00',
      eveningEndTime: profile.eveningEndTime || '17:00',
  });
  const [unavailableDates, setUnavailableDates] = useState(profile.unavailableDates || []);
  const [halfDaysOff, setHalfDaysOff] = useState(profile.halfDayOff || []);

  const handleScheduleChange = (e) => setSchedule({ ...schedule, [e.target.name]: e.target.value });
  const markDay = (slot) => {
    const dateStr = toDateString(selectedDate);
    const newUnavailable = unavailableDates.filter(d => d !== dateStr);
    const newHalfDays = halfDaysOff.filter(d => d.date !== dateStr);
    if (slot === 'full') {
        setUnavailableDates([...newUnavailable, dateStr]);
        toast.success(`${selectedDate.toLocaleDateString()} marked as a full day off.`);
    } else if (slot === 'morning' || slot === 'evening') {
        setHalfDaysOff([...newHalfDays, { date: dateStr, slot }]);
        setUnavailableDates(newUnavailable);
        toast.success(`${selectedDate.toLocaleDateString()} marked as ${slot} off.`);
    } else { // 'clear'
        setUnavailableDates(newUnavailable);
        setHalfDaysOff(newHalfDays);
        toast.success(`${selectedDate.toLocaleDateString()} is now fully available.`);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      const dataToSave = { ...schedule, unavailableDates, halfDayOff: halfDaysOff };
      const updatedProfile = await updateMyProviderProfileAPI(dataToSave);
      onProfileUpdate(updatedProfile);
      toast.success('Availability updated successfully!');
    } catch (error) {
      toast.error('Failed to update availability.');
    }
  };
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
        const dateStr = toDateString(date);
        if (unavailableDates.includes(dateStr)) return 'unavailable-date';
        const halfDay = halfDaysOff.find(d => d.date === dateStr);
        if (halfDay) return 'half-day-off';
    }
    return null;
  };
  const tileDisabled = ({ date, view }) => { /* ... */ };

  return (
    <div className="card space-y-8">
        <div>
            <h2 className="text-2xl font-semibold mb-4">Set Your Schedule & Capacity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Morning Start</label>
                    <input type="time" name="morningStartTime" value={schedule.morningStartTime} onChange={handleScheduleChange} className="w-full p-2 mt-1 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Morning End</label>
                    <input type="time" name="morningEndTime" value={schedule.morningEndTime} onChange={handleScheduleChange} className="w-full p-2 mt-1 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Evening Start</label>
                    <input type="time" name="eveningStartTime" value={schedule.eveningStartTime} onChange={handleScheduleChange} className="w-full p-2 mt-1 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Evening End</label>
                    <input type="time" name="eveningEndTime" value={schedule.eveningEndTime} onChange={handleScheduleChange} className="w-full p-2 mt-1 border rounded" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Max Morning Jobs</label>
                    <select name="morningCapacity" value={schedule.morningCapacity} onChange={handleScheduleChange} className="w-full p-2 mt-1 border rounded bg-white">
                        <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Max Evening Jobs</label>
                    <select name="eveningCapacity" value={schedule.eveningCapacity} onChange={handleScheduleChange} className="w-full p-2 mt-1 border rounded bg-white">
                        <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                    </select>
                </div>
            </div>
        </div>
        <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Mark Days Off</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex justify-center">
                    <Calendar onChange={setSelectedDate} value={selectedDate} tileClassName={tileClassName} tileDisabled={tileDisabled} />
                </div>
                <div className="space-y-3">
                    <p className="font-semibold text-center text-gray-700">For {selectedDate.toLocaleDateString()}:</p>
                    <button onClick={() => markDay('morning')} className="w-full p-2 border rounded-lg hover:bg-yellow-50 font-medium">Take Morning Off</button>
                    <button onClick={() => markDay('evening')} className="w-full p-2 border rounded-lg hover:bg-yellow-50 font-medium">Take Evening Off</button>
                    <button onClick={() => markDay('full')} className="w-full p-2 border bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">Take Full Day Off</button>
                    <button onClick={() => markDay('clear')} className="w-full p-2 border rounded-lg hover:bg-green-50 font-medium">Make Day Available</button>
                </div>
            </div>
        </div>
        <div className="text-center pt-6 border-t">
            <button onClick={handleSaveAvailability} className="btn-primary w-full md:w-auto">
                Save Availability Settings
            </button>
        </div>
    </div>
  );
};
export default AvailabilityTab;