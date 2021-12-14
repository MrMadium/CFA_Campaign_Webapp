const db = require(".")

module.exports = (sequelize, DataTypes) => {
    
    const Campaign = sequelize.define("Campaign", {
        campaignID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        campaignName: {
            type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: true,
            comment: "Name of Campaign (Public Facing)"
        },
        leadBrigade: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            references: {
                model: 'Brigade',
                key: 'brigadeID'
            },
            comment: "Lead Brigade responsible for Campaign"
        },
        campaignStart: {
            type: DataTypes.DATE,
            allowNull: true
        },
        campaignEnd: {
            type: DataTypes.DATE,
            allowNull: true
        },
        campaignNotes: {
            type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: true
        },
        campaignStatus: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            references: {
                model: 'CampaignStatus',
                key: 'statusID'
            }
        }
    
    }, {
        tableName: 'Campaign'
    })

    Campaign.associate = models => {
        Campaign.belongsTo(models.Brigade, {
            foreignKey: 'leadBrigade'
        })

        Campaign.belongsToMany(models.Appliance, {
            through: models.CampaignApplianceBridge,
            foreignKey: 'campaignID'
        })

        Campaign.belongsTo(models.CampaignStatus, {
            foreignKey: 'campaignStatus'
        })
    }

    return Campaign;

}