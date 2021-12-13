module.exports = (sequelize, DataTypes) => {
    
    const Route = sequelize.define("Route", {
        routeID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            comment: "Primary key that allocates for each route."
        },
        campaignID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'Campaign',
                key: 'campaignID'
            }
        },
        routeName: {
            type: DataTypes.STRING(45) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: true,
            default: null,
            comment: "Common name for operational reference - recommended NATO Alpha"
        },
        routeGeom: {
            type: DataTypes.GEOMETRY,
            allowNull: true,
            default: null,
            comment: "Geometry object(s) for the planned route."
        },
        routeNote: {
            type: DataTypes.STRING(100) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: true,
            default: null,
            comment: "Any additional notes for this route for the Driver to be mindful of?"
        }
    
    }, {
        tableName: 'Route'
    })

    Route.associate = models => {
        Route.belongsTo(models.Campaign, {
            foreignKey: 'campaignID'
        })
    }

    return Route;

}