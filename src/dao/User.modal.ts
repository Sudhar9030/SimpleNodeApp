import { DataTypes, Model } from "sequelize";
import sequelize from '../config/dbconfig'

class User extends Model {
  
}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: true
  }
},
{
  sequelize,
  modelName: 'User'
})

export default User;