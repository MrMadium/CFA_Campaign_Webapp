module.exports = (sequelize, DataTypes) => {
    
    const ApplianceClass = sequelize.define("ApplianceClass", {
        classID: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        applianceName: {
            type: DataTypes.STRING(40),
            allowNull: true,
            default: null,
            comment: "Common Name for Appliance Class"
        }
    }, {
        tableName: 'ApplianceClass'
    })

    return ApplianceClass;

}