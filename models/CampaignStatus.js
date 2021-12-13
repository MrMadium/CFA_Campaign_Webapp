module.exports = (sequelize, DataTypes) => {
    
    const CampaignStatus = sequelize.define("CampaignStatus", {
        statusID: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        statusDescription: {
            type: DataTypes.STRING(100) + ' CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
            allowNull: false,
        }
    }, {
        tableName: 'CampaignStatus'
    })
    
    CampaignStatus.associate = models => {
    }

    return CampaignStatus;

}