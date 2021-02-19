import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { FormattedMessage } from 'react-intl';

import {
  makeQueryFunction,
  StripesConnectedSource,
} from '@folio/stripes/smart-components';
import {
  AppIcon,
  stripesConnect,
} from '@folio/stripes/core';

import filterConfig from './filterConfig';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;
const columnWidths = {
  isChecked: '8%',
  title: '40%',
  contributors: '32%',
  publishers: '20%',
};
const visibleColumns = ['title', 'contributors', 'publishers'];
const columnMapping = {
  title: <FormattedMessage id="ui-plugin-rs-siquery-folio.columns.title" />,
  contributors: <FormattedMessage id="ui-plugin-rs-siquery-folio.columns.contributors" />,
  publishers: <FormattedMessage id="ui-plugin-rs-siquery-folio.columns.publishers" />,
};

const idPrefix = 'uiPluginFindInstance-';
const modalLabel = <FormattedMessage id="ui-plugin-rs-siquery-folio.modal.title" />;

const setFilterValues = (resource, filterName, nameAttr, cqlAttr) => {
  const filterValues = get(resource, 'records') || [];

  if (filterValues.length) {
    const filterConfigObj = filterConfig.find(group => group.name === filterName);

    filterConfigObj.values = filterValues.map(rec => ({ name: rec[nameAttr], cql: rec[cqlAttr] }));
  }
};

const contributorsFormatter = (r, contributorTypes) => {
  let formatted = '';

  if (r.contributors && r.contributors.length) {
    for (let i = 0; i < r.contributors.length; i += 1) {
      const contributor = r.contributors[i];
      const type = contributorTypes.find(ct => ct.id === contributor.contributorNameTypeId);

      formatted += (i > 0 ? ' ; ' : '') +
                   contributor.name +
                   (type ? ` (${type.name})` : '');
    }
  }

  return formatted;
};

class FindInstanceContainer extends React.Component {
  static manifest = Object.freeze({
    query: {
      initialValue: {
        query: '',
        filters: '',
      },
    },
    records: {
      throwErrors: false,
      type: 'okapi',
      records: 'instances',
      path: '!{endpoint}',
      recordsRequired: '%{resultCount}',
      perRequest: RESULT_COUNT_INCREMENT,
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            '(title="%{query.query}" or contributors =/@name "%{query.query}" or identifiers =/@value "%{query.query}")',
            {},
            filterConfig,
            2,
          ),
        },
        staticFallback: { params: {} },
      },
    },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
  });

  constructor(props, context) {
    super(props, context);

    this.logger = props.stripes.logger;
    this.log = this.logger.log.bind(this.logger);
  }

  componentDidMount() {
    this.source = new StripesConnectedSource(this.props, this.logger);
    this.props.mutator.query.replace('');
  }

  componentDidUpdate() {
    const { resources } = this.props;
    this.source.update(this.props);
  }

  onNeedMoreData = () => {
    if (this.source) {
      this.source.fetchMore(RESULT_COUNT_INCREMENT);
    }
  };

  querySetter = ({ nsValues, state }) => {
    if (/reset/.test(state.changeType)) {
      this.props.mutator.query.replace(nsValues);
    } else {
      this.props.mutator.query.update(nsValues);
    }
  }

  queryGetter = () => {
    return get(this.props.resources, 'query', {});
  }

  render() {
    const {
      resources,
      children,
    } = this.props;
    const contributorTypes = get(resources, 'contributorTypes.records') || [];

    const resultsFormatter = {
      title: ({ title }) => (
        <AppIcon
          size="small"
          app="inventory"
          iconKey="instance"
        >
          {title}
        </AppIcon>
      ),
      contributors: r => contributorsFormatter(r, contributorTypes),
      publishers: r => r.publication.map(p => (p ? `${p.publisher} ${p.dateOfPublication ? `(${p.dateOfPublication})` : ''}` : '')).join(', '),
    };

    if (this.source) {
      this.source.update(this.props);
    }

    return children({
      columnMapping,
      columnWidths,
      filterConfig,
      idPrefix,
      modalLabel,
      onNeedMoreData: this.onNeedMoreData,
      queryGetter: this.queryGetter,
      querySetter: this.querySetter,
      resultsFormatter,
      source: this.source,
      visibleColumns,
      data: {
        records: get(resources, 'records.records', []),
      },
    });
  }
}

FindInstanceContainer.propTypes = {
  stripes: PropTypes.object.isRequired,
  children: PropTypes.func,
  mutator: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
};

export default stripesConnect(FindInstanceContainer, { dataKey: 'find_instance' });
