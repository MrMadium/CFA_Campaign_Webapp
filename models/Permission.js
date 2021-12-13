module.exports = (sequelize, DataTypes) => {
    
    const Permission = sequelize.define("Permission", {
        permissionID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        permissionName: {
            type: DataTypes.STRING(20),
            allowNull: true,
            default: null
        },
        permissionDescription: {
            type: DataTypes.STRING(255),
            allowNull: true,
            default: null,
            comment: "Brief description of permission level"
        }
    }, {
        tableName: 'Permission'
    })

    return Permission;

}