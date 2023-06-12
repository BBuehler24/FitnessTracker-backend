const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows: [newRoutActivity] } = await client.query(`
      INSERT INTO "routine_activities" ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [routineId, activityId, count, duration]);

    return newRoutActivity;
  } catch (error) {
      console.log(error);
  }

}

async function getRoutineActivityById(id) {
  try {
    const { rows: [routineActivity] } = await client.query(`
      SELECT * FROM routine_activities
      WHERE id = $1;
    `, [id]);

    return routineActivity;
  } catch (error) {
    console.log(error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routineActivities } = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId" = $1;
    `, [id]);

    return routineActivities;
  } catch (error) {
    console.log(error);
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    const setString = Object.keys(fields).map((key, idx) => `${key} = $${idx + 1}`).join(', ');

  const { rows: [updatedRoutineActivity] } = await client.query(`
  UPDATE routine_activities
  SET ${setString}
  WHERE id = ${id}
  RETURNING *;
  `, Object.values(fields));

  return updatedRoutineActivity;
  } catch (error) {
    console.log(error);
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [removedRoutineActivity] } = await client.query(`
      DELETE FROM routine_activities
      WHERE id = $1
      RETURNING *;
    `, [id]);

    return removedRoutineActivity;
  } catch (error) {
    console.log(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT * FROM routines
      WHERE id = (SELECT "routineId" FROM routine_activities WHERE id = $1);
    `, [routineActivityId]);

    if (routine.creatorId === userId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
