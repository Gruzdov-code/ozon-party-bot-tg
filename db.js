const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host: 'master.0d476373-48c1-4443-b0cb-dfecdf3fb0de.c.dbaas.selcloud.ru',
        port: '5432',
        dialect: 'postgres'
    }
)
