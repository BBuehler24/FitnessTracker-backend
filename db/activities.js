const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [ activity ] } = await client.query(`
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `, [name, description]);

    return activity;
  } catch (error) {
      console.log(error);
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows: activities } = await client.query(`
      SELECT * FROM activities;
    `)

    return activities
  } catch (error) {
      console.log(error);
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * FROM activities
      WHERE id = $1;
    `, [id]);

    return activity;
  } catch (error) {
    console.log(error);
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * FROM activities
      WHERE name = $1;
    `, [name]);

    return activity;
  } catch (error) {
    console.log(error);
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  try {
    const newRoutine = [];

    for (let routine of routines) {
      const routineId = routine.id;

      const { rows: activities } = await client.query(`
        SELECT a.id, name, description, duration, count, "routineId", ra.id "routineActivityId"
        FROM routine_activities ra
        JOIN activities a ON ra."activityId" = a.id
        WHERE "routineId" = $1;
      `, [routineId]);

      routine.activities = activities;
      newRoutine.push(routine);
    }
    return newRoutine;
  } catch (error) {
    console.log(error);
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  try {
    const keysToUpdate = [];
    const valuesToUpdate = [];

    if (fields.name) {
      keysToUpdate.push('name');
      valuesToUpdate.push(fields.name);
    }

    if (fields.description) {
      keysToUpdate.push('description');
      valuesToUpdate.push(fields.description);
    }

    const setString = keysToUpdate.map((key, idx) => `${key} = '${valuesToUpdate[idx]}'`).join(', ');

    const { rows: [activity] } = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `);

    return activity;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
