import { DEFAULT_LEGENDS } from '../constants/default-legend';
import * as _ from 'lodash';
import { Legend } from '../models/legend-set';

export function getLegendSetsConfiguration(selectedItems, legendSetEntities) {
  return _.map(selectedItems, selectedItem => {
    const index = _.indexOf(selectedItems, selectedItem) + 1;
    return legendSetEntities && legendSetEntities[selectedItem.id]
      ? legendSetEntities[selectedItem.id]
      : {
          id: selectedItem.id,
          name: selectedItem.name ? selectedItem.name : 'item ' + index,
          legends: getDefaultLegends()
        };
  });
}

export function getNewLegend(legends: Legend[]): Legend {
  legends = _.reverse(_.sortBy(legends, 'startValue'));
  return {
    id: getUniqueId(),
    name: 'Unititled',
    color: '#fff',
    startValue: legends[0].endValue + 1,
    endValue: legends[0].endValue + 10
  };
}

export function getDefaultLegends() {
  return _.sortBy(
    _.map(DEFAULT_LEGENDS, legend => {
      legend.id = getUniqueId();
      return legend;
    }),
    'startValue'
  );
}

export function getUniqueId(): string {
  let uid = '';
  const possible_combinations =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 11; i++) {
    uid += possible_combinations.charAt(
      Math.floor(Math.random() * possible_combinations.length)
    );
  }
  return uid;
}
