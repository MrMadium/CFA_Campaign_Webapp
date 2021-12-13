module.exports = (sequelize, DataTypes) => {
    
    const RouteRecord = sequelize.define("RouteRecord", {
        sessionID: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        userID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "'Who is writing this record.'"
        },
        applianceID: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        timeStart: {
            type: 'TIMESTAMP',
            allowNull: false
        },
        lastUpdate: {
            type: 'TIMESTAMP',
            allowNull: true,
            default: null
        },
        timeEnd: {
            type: 'TIMESTAMP',
            allowNull: true,
            default: null
        },
        recordedGeom: {
            type: DataTypes.GEOMETRY,
            allowNull: true,
            default: null
        },
        routeID: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        campaignID: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
    }, {
        tableName: 'RouteRecord'
    })

    RouteRecord.associate = models => {
        
    }

    return RouteRecord;

}