const express = require('express');
const activitiesRouter = express.Router();
const {
    getAllActivities,
    getActivityByName,
    createActivity,
    getPublicRoutinesByActivity,
    updateActivity,
    getActivityById,

} = require('../db')

// Check router working:
activitiesRouter.use((req, res, next) => {
    console.log("Request is being made to activities")
    next();
});

// GET /api/activities/:activityId/routines
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
    const { activityId } = req.params;

    try {
        const routines = await getPublicRoutinesByActivity({ id: activityId });
        if (!routines[0]) {
            next({
                name: 'ActivityDoesNotExist',
                message: `Activity ${activityId} not found`
            });
        }
        res.send(routines);
    } catch (error) {
        console.log(error);
    }
})

// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {
    try {
        const allActivities = await getAllActivities();
        console.log(allActivities);
        res.send(allActivities);
    } catch (error) {
        console.log(error);
    }
});

// POST /api/activities
activitiesRouter.post('/', async (req, res, next) => {
    const { name, description } = req.body;
    const checkIfAlreadyExists = await getActivityByName(name);

    try {
        if (checkIfAlreadyExists) {
            next({
                name: 'ActivityExistsError',
                message: `An activity with name ${name} already exists`
            });
        }
        
        const addedActivity = await createActivity({ name, description });
        res.send(addedActivity);
    } catch (error) {
        console.log(error);
    }
});

// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;
    const checkIdExists = await getActivityById(activityId);
    const checkNameExists = await getActivityByName(name);

    try {
        if (!checkIdExists) {
            next({
                name: 'ActivityNotFound',
                message: `Activity ${activityId} not found`
            });
        }

        if (checkNameExists) {
            next({
                name: 'ActivityExistsWithThatName',
                message: `An activity with name ${name} already exists`
            });
        }

        const revisedActivity = await updateActivity({
            id: activityId,
            name,
            description
        });
        res.send(revisedActivity);
    } catch (error) {
        console.log(error);
    }
});


module.exports = activitiesRouter;
