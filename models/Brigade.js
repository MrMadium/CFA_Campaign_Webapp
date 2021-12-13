module.exports = (sequelize, DataTypes) => {
    
    const Brigade = sequelize.define("Brigade", {
        brigadeID: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        brigadeName: {
            type: DataTypes.STRING(100) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: false
        },
        brigadeAddress: {
            type: DataTypes.STRING(100) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: true,
            default: null
        },
        brigadeLocation: {
            type: DataTypes.GEOMETRY('POINT'),
            allowNull: true,
            default: null,
            comment: "GEOM Point Location of Brigade"
        }
    }, {
        tableName: 'Brigade'
    })

    Brigade.associate = models => {
        Brigade.belongsToMany(models.User, {
            through: models.UserBrigadeBridge,
            foreignKey: 'brigadeID'
        })
    }

    return Brigade;

}