'use strict';
module.exports = (sequelize, DataTypes) => {
    const documento = sequelize.define('documento', {
        nombre: { type: DataTypes.STRING(80), defaultValue: "NO_DATA", unique: false},
        external_id: { type: DataTypes.STRING( 36), defaultValue: "NO_DATA", unique: true},
    }, {
        freezeTableName: true
    });

    documento.associate = function (models){
        documento.hasOne(models.audio, { foreignKey: 'id_documento', as: 'audio'});
        documento.belongsTo(models.entidad, {foreignKey: 'id_entidad'});
    }

    return documento;
};