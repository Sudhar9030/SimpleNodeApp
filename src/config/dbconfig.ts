import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { doesNotReject } from 'node:assert';
import { Sequelize } from 'sequelize';
//import { sql } from 'mssql'



const sequelize = new Sequelize('webtroit', '{id}', '{password}', {
    dialect: 'mssql',
    host: 'localhost',
    port:1433,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    define:{
        defaultScope: {
            attributes: {
                exclude:['id', 'createdAt', 'updatedAt']
            }
        }
    }
})

try{
    sequelize.authenticate()
        .then(() => console.log('Connection Successful'))
        .catch(error => console.log(error))
        .finally(() => console.log('authentication complete'));
    
}catch(error){
    console.log(error)
}




export default sequelize;