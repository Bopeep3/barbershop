require('dotenv').config();

const { Sequelize } = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser');
const Appointment = require('./appointmentModel');

const app = express();
const port = 8090; 

app.use(bodyParser.json());

Appointment.sequelize.sync().then(() => {
    console.log(`Database & tables created!`);
});


app.get('/appointments', async (req, res) => {
    try {
        const { upcoming, email } = req.query;
        let whereCondition = {};

        if (upcoming === 'true') {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            whereCondition.appointmentDate = {
                [Sequelize.Op.gte]: now,
                [Sequelize.Op.lt]: tomorrow,
            };
        }

        if (email) {
            whereCondition.email = email; 
        }

        const appointments = await Appointment.findAll({
            where: whereCondition,
            order: [['appointmentDate', 'ASC']], 
        });

        res.status(200).send(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send(error);
    }
});

app.get('/appointments/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const appointment = await Appointment.findOne({ where: { id } });

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found'});
        }

        res.status(200).send(appointment);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).send(error);
    }
});

app.post('/appointments', async (req, res) => {
    try {
        const { name, service, phoneNumber, email, appointmentDate } = req.body;
        const newAppointment = await Appointment.create({ name, service, phoneNumber, email, appointmentDate });
        res.status(201).send(newAppointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).send(error);
    }
});

app.put('/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const { name, service, phoneNumber, email, appointmentDate } = req.body;

    try {
        const appointment = Appointment.findOne({ where: { id } });

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found'});
        }

        appointment.name = name;
        appointment.service = service;
        appointment.phoneNumber = phoneNumber;
        appointment.email = email;
        appointment.appointmentDate = appointmentDate;

        await appointment.save();
        res.status(200).send(appointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).send(error);
    }
});

app.delete('/appointments/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Appointment.destroy({ where: { id } });

        if (result === 0) {
            return res.status(404).send({ message: 'Appointment not found'});
        }

        res.status(200).send({ message: 'Appointment deleted successfully'});
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
