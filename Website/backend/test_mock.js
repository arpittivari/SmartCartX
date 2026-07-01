const req = {
    app: {
        get: (key) => {
            if (key === 'mqttClient') {
                return { publish: () => {} };
            }
            return null;
        }
    }
};

const mqttClient = req.app.get('mqttClient');
console.log(mqttClient);
