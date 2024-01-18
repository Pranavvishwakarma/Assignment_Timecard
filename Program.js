const fs = require('fs');

function analyzeTimeRecords(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const records = fileContent.split('\n').map(line => line.split('\t'));

  const employees = {};

  for (const record of records) {
    const [positionId, positionStatus, timeIn, timeOut, timecardHours, payCycleStartDate, payCycleEndDate, employeeName, fileNumber] = record;

    if (!(employeeName in employees)) {
      employees[employeeName] = { positions: new Set(), shifts: [] };
    }

    employees[employeeName].positions.add(positionId);
    employees[employeeName].shifts.push({ timeIn, timeOut });
  }

  for (const [employee, data] of Object.entries(employees)) {
    let consecutiveDays = 0;
    let lessThan10Hours = 0;
    let moreThan14Hours = 0;

    for (let i = 0; i < data.shifts.length - 1; i++) {
      const timeIn1 = new Date(data.shifts[i].timeIn);
      const timeOut1 = data.shifts[i].timeOut ? new Date(data.shifts[i].timeOut) : null;
      const timeIn2 = new Date(data.shifts[i + 1].timeIn);
     
      // Check consecutive days
      if (Math.abs(timeIn2 - timeIn1) / (1000 * 60 * 60 * 24) === 1) {
        consecutiveDays += 1;
      } else {
        consecutiveDays = 0;
      }

      // Check time between shifts
      const timeBetweenShifts = (timeIn2 - timeOut1) / (1000 * 60 * 60);
      if (1 < timeBetweenShifts && timeBetweenShifts < 10) {
        lessThan10Hours += 1;
      }

      // Check total hours in a single shift
      if (timeOut1) {
        const shiftHours = (timeOut1 - timeIn1) / (1000 * 60 * 60);
        if (shiftHours > 14) {
          moreThan14Hours += 1;
        }
      }
    }

    if (consecutiveDays >= 6) {
      console.log(`${employee} has worked for 7 consecutive days.`);
    }

    if (lessThan10Hours > 0) {
      console.log(`${employee} has less than 10 hours between shifts but greater than 1 hour.`);
    }

    if (moreThan14Hours > 0) {
      console.log(`${employee} has worked for more than 14 hours in a single shift.`);
    }
  }
}

const filePath = 'Assignment_Timecard.csv';
analyzeTimeRecords(filePath);

