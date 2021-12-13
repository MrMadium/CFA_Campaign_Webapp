module.exports = (sequelize, DataTypes) => {
    
    const User = sequelize.define("User", {
        userID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        userName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        hash: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        permissionLevel: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            default: 1,
            references: {
                model: 'Permission',
                key: 'permissionID'
            }
        },
        memberID: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            default: null
        }
    }, {
        tableName: 'User'
    })

    User.associate = models => {
        User.belongsTo(models.Permission, {
            foreignKey: 'permissionLevel'
        })

        User.belongsToMany(models.Brigade, {
            through: models.UserBrigadeBridge,
            foreignKey: 'userID'
        })
    }

    return User;

}