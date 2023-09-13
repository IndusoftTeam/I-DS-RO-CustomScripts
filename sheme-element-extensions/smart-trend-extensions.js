/** 
 * Расширение базового функционал для активного элемента мнемосхемы SmartTrend.
 * Вызов расширений осуществляется через экземпляр элемента SmartTrend с указанием необходимой функции
 * например, trend.functionName(arg1, .. ,argN )
 * ,где trend - экземпляр элемента SmartTrend, functionName - функция определенная в расширении, arg - аргументы функции 
*/

/**
 * Отобразить график тренда для произвольных тегов(атрибутов)
 * @param arrAttributes - масив наименований тегов(атрибутов), например ["TSDB.\\TSDB_SERVER\tag1", "ddec14ad-0f52-4f23-bddb-cf19edeb4323"]
 * @param configOptions - объект конфигурации SmartTrend
 */
iDte.SmartTrendElement.prototype.showGraph = function(arrAttributes, configOptions){    
    
    if(Array.isArray(arrAttributes) === false)
        throw new Error("Аргумент arrAttributes не является массивом");
    
    let config = $.extend(configOptions, { //расширение конфигурации
        trendState: "update",
        attributes: arrAttributes
    });

    this.changeConfiguration(config);
    this.resetPartialUpdate()
    this.getController().updateDataDirectly(this);
}