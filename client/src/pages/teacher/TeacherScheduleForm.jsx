import { useState } from "react";

export default function TeacherScheduleForm() {
  const [availability, setAvailability] = useState({
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });

  const handleChange = (day, value) => {
    setAvailability({ ...availability, [day]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("teacherSchedule", JSON.stringify(availability));
    alert("Schedule saved!");
  };

  return (
    <div className="min-h-screen bg-yellow-100 p-6 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl space-y-4">
        <h2 className="text-xl font-bold text-center text-yellow-700">Set Your Weekly Availability</h2>

        {Object.keys(availability).map((day) => (
          <div key={day}>
            <label className="block capitalize font-medium mb-1">{day}</label>
            <input
              type="text"
              placeholder="e.g. 10AM - 12PM"
              className="input"
              value={availability[day]}
              onChange={(e) => handleChange(day, e.target.value)}
            />
          </div>
        ))}

        <button className="bg-yellow-600 text-white w-full py-2 rounded hover:bg-yellow-700">Save Schedule</button>
      </form>
    </div>
  );
}
