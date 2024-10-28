'use strict';
module.exports = (sequelize, DataTypes) => {
    const audio = sequelize.define('audio', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4,unique: true},
        nombre: { type: DataTypes.STRING(80), defaultValue: "NO_DATA", unique: true},
        tiempo_reproduccion: { type: DataTypes.STRING(150), allowNull: false }
    }, {
        freezeTableName: true
    });

    audio.associate = function (models){
        audio.belongsTo(models.documento, {foreignKey: 'id_documento'});
    }

    return audio;
};