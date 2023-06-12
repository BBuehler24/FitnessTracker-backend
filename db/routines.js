const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const newRoutQuery = await client.query(`
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [creatorId, isPublic, name, goal]);

    const newRoutine = newRoutQuery.rows[0];
    if (!newRoutine) {
      throw new Error('Error Creating Routine')
    }

    return newRoutine;
  } catch (error) {
    console.log(error);
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT * FROM routines
      WHERE id = $1;
    `, [id]);

    return routine;
  } catch (error) {
    console.log(error);
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routinesWithoutActivities } = await client.query(`
      SELECT * FROM routines
      WHERE id NOT IN (SELECT "routineId" FROM routine_activities);
    `)

    return routinesWithoutActivities;
  } catch (error) {
    console.log(error);
  }

}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.id, r."creatorId", u.username "creatorName", r."isPublic", r.name, r.goal
      FROM routines r
      JOIN users u ON r."creatorId" = u.id;
    `);

    const updatedRoutines = await attachActivitiesToRoutines(routines);
    return updatedRoutines;
  } catch (error) {
    console.log(error);
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.*, u.username "creatorName"
      FROM routines r
      JOIN users u ON r."creatorId" = u.id
      WHERE "isPublic" = true;
    `);

    const updatedRoutines = await attachActivitiesToRoutines(routines);
    return updatedRoutines;
  } catch (error) {
    console.log(error);
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
    SELECT r.* , u.username "creatorName"
    FROM routines r
    JOIN users u ON r."creatorId" = u.id
    WHERE "creatorId" = (SELECT id FROM users WHERE username = $1);
    `,[username]);

    const updatedRoutines = await attachActivitiesToRoutines(routines);
  
    return updatedRoutines;
  } catch (error) {
    console.log(error);
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
    SELECT r.* , u.username "creatorName"
    FROM routines r
    JOIN users u ON r."creatorId" = u.id
    WHERE "creatorId" = (SELECT id FROM users WHERE username = $1)
    AND "isPublic";
    `,[username]);

    const updatedRoutines = await attachActivitiesToRoutines(routines);
  
    return updatedRoutines;
  } catch (error) {
    console.log(error);
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(`
    SELECT r.* , u.username "creatorName"
    FROM routines r
    JOIN users u ON r."creatorId" = u.id
    WHERE r.id IN 
    (SELECT "routineId" FROM "routine_activities" WHERE "activityId" = $1)
    AND "isPublic";
    `,[id]);
  
    const updatedRoutines = await attachActivitiesToRoutines(routines);
  
    return updatedRoutines;
  } catch (error) {
    console.log(error);
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const setString = Object.keys(fields)
    .map((key, idx) => `"${key}" = $${idx + 1}`)
    .join(', ');

  const { rows: [routine] } = await client.query(`
  UPDATE routines
  SET ${setString}
  WHERE id = ${id}
  RETURNING *;
  `, Object.values(fields));

  return routine;
  } catch (error) {
    console.log(error);
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId" = ${id};
      `);
  
    const { rows: [removedRoutine] } = await client.query(`
      DELETE FROM routines
      WHERE id = ${id}
      RETURNING *;
      `);

    return removedRoutine;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
