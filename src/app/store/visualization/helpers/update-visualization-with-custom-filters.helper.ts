import {Visualization} from '../visualization.state';
import * as _ from 'lodash';

export function updateVisualizationWithCustomFilters(visualization: Visualization, customFilterObject: any) {
  const newVisualization: Visualization = _.cloneDeep(visualization);
  const filterArray: any[] = [...visualization.details.filters];

  const newFilterArray: any[] = filterArray.map((filterObject: any) => {
    const newFilterObject: any = {...filterObject};
    const newFilters = filterObject.filters.map((filter: any) => {
      const newFilter: any = {...filter};
      if (customFilterObject.name === newFilter.name) {
        newFilter.value = customFilterObject.value;
        newFilter.items = [...mapFilterItemsToFavoriteFormat(customFilterObject.items, filter.name)];
      }
      return newFilter;
    });

    newFilterObject.filters = [...newFilters];
    return newFilterObject;
  });

  newVisualization.details.filters = [...newFilterArray];

  // TODO FIND BEST WAY TO MAKE FILTER CHANGES CONSISTENCE
  /**
   * Also update layers with filters
   */

  newVisualization.operatingLayers = [...updateLayersWithCustomFilters(newVisualization.operatingLayers, newFilterArray)];

  newVisualization.layers = [...newVisualization.operatingLayers];

  return newVisualization;
}

function mapFilterItemsToFavoriteFormat(filterItems, dimensionType) {
  const newFilterItems: any = [];

  filterItems.forEach(filterItem => {
    if (dimensionType === 'pe') {
      newFilterItems.push({
        id: filterItem.id,
        dimensionItem: filterItem.id,
        displayName: filterItem.name,
        dimensionItemType: 'PERIOD'
      });
    } else if (dimensionType === 'ou') {
      newFilterItems.push({
        id: filterItem.id,
        dimensionItem: filterItem.id,
        startingName: filterItem.startingName,
        displayName: filterItem.name,
        dimensionItemType: filterItem.id.indexOf('LEVEL') !== -1 ? 'LEVEL' :
          filterItem.id.indexOf('OU_GROUP') !== -1 ? 'GROUP' : 'ORGANISATION_UNIT'
      });
    } else if (dimensionType === 'dx') {
      newFilterItems.push({
        id: filterItem.id,
        dimensionItem: filterItem.id,
        displayName: filterItem.name,
        dimensionItemType: filterItem.dataElementId ? 'DATA_ELEMENT' : 'INDICATOR'
      });
    }
  });

  return newFilterItems;
}

function updateLayersWithCustomFilters(visualizationLayers, customFilters) {
  return _.map(visualizationLayers, (layer) => {
    const newLayer = _.clone(layer);
    const newSettings = _.clone(layer.settings);
    const correspondingFilter = _.find(customFilters, ['id', layer.settings.id]);
    if (correspondingFilter) {
      newSettings.columns = updateLayoutDimensionWithFilters(newSettings.columns, correspondingFilter.filters);
      newSettings.rows = updateLayoutDimensionWithFilters(newSettings.rows, correspondingFilter.filters);
      newSettings.filters = updateLayoutDimensionWithFilters(newSettings.filters, correspondingFilter.filters);
    }

    newLayer.settings = {...newSettings};
    return newLayer;
  });
}

function updateLayoutDimensionWithFilters(layoutDimensionArray, filters) {
  return _.map(layoutDimensionArray, (layoutDimension) => {
    const newLayoutDimension = _.clone(layoutDimension);
    const dimensionObject = _.find(filters, ['name', layoutDimension.dimension]);

    /**
     * Get items
     */
    if (dimensionObject) {
      newLayoutDimension.items = _.assign([], dimensionObject.items);
    }

    return newLayoutDimension;
  });
}
