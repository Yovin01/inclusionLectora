'use strict';
module.exports = (sequelize, DataTypes) => {
    const audio = sequelize.define('audio', {
        external_id: { type: DataTypes.STRING( 36), defaultValue: "NO_DATA", unique: true},
        tiempo_reproduccion: { type:  DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
    }, {
        freezeTableName: true
    });

    audio.associate = function (models){
        audio.belongsTo(models.documento, {foreignKey: 'id_documento'});
    }

    return audio;
};