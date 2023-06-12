const express = require('express');
const routinesRouter = express.Router();

const {
  getAllPublicRoutines,
  addActivityToRoutine,
  updateRoutine,
  createRoutine, 
  destroyRoutine,
  getRoutineById,
  getRoutineActivitiesByRoutine,
} = require('../db');

routinesRouter.use((req, res, next) => {
  console.log('Request made to routines');
  next();
});

// GET /api/routines
routinesRouter.get('/', async (req, res, next) => {
  try {
    const routines = await getAllPublicRoutines();
    res.send(routines);
  } catch (error) {
    console.log(error);
  }
});

// POST /api/routines
routinesRouter.post('/', async (req, res, next) => {
  const { name, isPublic, goal } = req.body;
  try {
    if (req.user) {
      const creatorId = req.user.id;
      const addedRoutine = await createRoutine({
        creatorId,
        name,
        isPublic,
        goal,
      });
      res.send(addedRoutine);
    } else {
      next({
        message: 'You must be logged in to perform this action',
        name: 'NotLoggedIn'
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// PATCH /api/routines/:routineId
routinesRouter.patch('/:routineId', async (req, res, next) => {
  const { routineId } = req.params;
  const { name, isPublic, goal } = req.body;
  
  try {
    if (req.user) {
      const routineToBeUpdated = await getRoutineById(routineId);
      if (routineToBeUpdated.creatorId !== req.user.id) {
        res.status(403).send({
            name: 'WrongUserError',
            message: `User ${req.user.username} is not allowed to update ${routineToBeUpdated.name}`,
            error: 'Error'
        });
      }

      const revisedRoutine = await updateRoutine({
        id: routineId,
        name,
        isPublic,
        goal,
      });
      res.send(revisedRoutine);
    } else {
      next({
        message: 'You must be logged in to perform this action',
        name: 'NotLoggedIn',
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// DELETE /api/routines/:routineId
routinesRouter.delete('/:routineId', async (req, res, next) => {
  const { routineId } = req.params;
  try {
    if (req.user) {
      const removedRoutine = await getRoutineById(routineId);
      if (removedRoutine.creatorId !== req.user.id) {
        res.status(403).send({
            name: 'UnauthorizedUser',
            message: `User ${req.user.username} is not allowed to delete ${removedRoutine.name}`,
            error: 'Error'
        });
      }

      const destroyedRoutine = await destroyRoutine(routineId);
      res.send(destroyedRoutine);
    }
  } catch (error) {
    console.log(error);
  }
});

// POST /api/routines/:routineId/activities
routinesRouter.post('/:routineId/activities', async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, count, duration } = req.body;

  try {
    const routActByRoutine = await getRoutineActivitiesByRoutine({
      id: routineId,
    });

    const findMatches = routActByRoutine.find(
      (routine) =>
        activityId == routine.activityId && routineId == routine.routineId
    );

    if (findMatches) {
      next({
        name: 'RoutineActivityAlreadyExists',
        message: `Activity ID ${activityId} already exists in Routine ID ${findMatches.routineId}`,
      });
    }

    const routActivity = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });

    res.send(routActivity);
  } catch (error) {
    console.log(error);
  }
});

module.exports = routinesRouter;
