const express = require('express');
const routineActivitiesRouter = express.Router();
const {
    updateRoutineActivity,
    getRoutineActivityById,
    getRoutineById,
    destroyRoutineActivity
} = require('../db');

routineActivitiesRouter.use((req, res, next) => {
    console.log('A request is being made to activities');
    next();
});

// PATCH /api/routine_activities/:routineActivityId
routineActivitiesRouter.patch('/:routineActivityId', async (req, res, next) => {
    const { duration, count } = req.body;
    const { routineActivityId } = req.params;

    try {
        const { routineId } = await getRoutineActivityById(routineActivityId);
        // if(!routineId) {
        //     next({
        //         name: "Doesnotexist",
        //         message: "RoutineId does not exist"
        //     });
        // }
        const routine = await getRoutineById(routineId);
        console.log(routine);

        console.log(typeof routine.creatorId, typeof req.user.id);
        if (routine.creatorId !== req.user.id) {
            next({
                name: 'UnauthorizedUser',
                message: `User ${req.user.username} is not allowed to update ${routine.name}`
            });
        }

        const revisedRoutineActivity = await updateRoutineActivity({
            id: routineActivityId,
            duration,
            count
        });
        res.send(revisedRoutineActivity);
    } catch (error) {
        console.log(error);
    }
});

// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete('/:routineActivityId', async (req, res, next) => {
      const { routineActivityId } = req.params;
  
      try {
        const { routineId } = await getRoutineActivityById(routineActivityId);
        const routine = await getRoutineById(routineId);
  
        if (routine.creatorId !== req.user.id) {
          res.status(403).send({
            name: 'UnauthorizedUser',
            message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
            error: 'Error'
          });
        }
  
        const removedActivity = await destroyRoutineActivity(
          routineActivityId
        );
  
        res.send(removedActivity);
      } catch (error) {
        console.log(error);
      }
    }
  );

module.exports = routineActivitiesRouter;
