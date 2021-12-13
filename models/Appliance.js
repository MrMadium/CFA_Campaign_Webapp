module.exports = (sequelize, DataTypes) => {
    
    const Appliance = sequelize.define("Appliance", {
        applianceID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        brigadeID: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            references: {
                model: 'Brigade',
                key: 'brigadeID'
            }
        },
        publicName: {
            type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: true,
            default: null,
            comment: "Public Facing name for appliance (ie. Basin Tanker 1)"
        },
        applianceClass: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            default: null,
            references: {
                model: 'ApplianceClass',
                key: 'classID'
            },
            comment: "Type of Appliance"
        }
    }, {
        tableName: 'Appliance'
    })

    Appliance.associate = models => {
        Appliance.belongsTo(models.Brigade, {
            foreignKey: 'brigadeID'
        })
        Appliance.belongsTo(models.ApplianceClass, {
            foreignKey: 'applianceClass'
        })
        Appliance.belongsToMany(models.Campaign, {
            through: models.CampaignApplianceBridge,
            foreignKey: 'applianceID'
        })
    }

    return Appliance;

}