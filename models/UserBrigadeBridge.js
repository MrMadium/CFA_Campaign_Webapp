module.exports = (sequelize, DataTypes) => {
    
    const UserBrigadeBridge = sequelize.define("UserBrigadeBridge", {
        userID: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'User',
                key: 'userID'
            }
        },
        brigadeID: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'Brigade',
                key: 'brigadeID'
            }
        }
    }, {
        tableName: 'UserBrigadeBridge'
    })

    UserBrigadeBridge.associate = models => {
        UserBrigadeBridge.belongsTo(models.User, {
            foreignKey: 'userID'
        })

        UserBrigadeBridge.belongsTo(models.Brigade, {
            foreignKey: 'brigadeID'
        })
    }

    return UserBrigadeBridge;

}