module.exports = (sequelize, DataTypes) => {
    
    const CampaignApplianceBridge = sequelize.define("CampaignApplianceBridge", {
        campaignID: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            default: null
        },
        applianceID: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            default: null
        }
    }, {
        tableName: 'CampaignApplianceBridge'
    })

    CampaignApplianceBridge.associate = models => {
        CampaignApplianceBridge.belongsTo(models.Campaign, {
            foreignKey: 'campaignID'
        })

        CampaignApplianceBridge.belongsTo(models.Appliance, {
            foreignKey: 'applianceID'
        })
    }

    return CampaignApplianceBridge;

}