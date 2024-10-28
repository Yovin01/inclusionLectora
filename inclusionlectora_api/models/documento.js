'use strict';
module.exports = (sequelize, DataTypes) => {
    const documento = sequelize.define('documento', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4,unique: true},
        nombre: { type: DataTypes.STRING(80), defaultValue: "NO_DATA", unique: false},
        nombre_cifrado: { type: DataTypes.STRING(80), defaultValue: "NO_DATA", unique: true},
    }, {
        freezeTableName: true
    });

    documento.associate = function (models){
        documento.hasOne(models.audio, { foreignKey: 'id_documento', as: 'audio'});
        documento.belongsTo(models.entidad, {foreignKey: 'id_entidad'});

    }

    return documento;
};