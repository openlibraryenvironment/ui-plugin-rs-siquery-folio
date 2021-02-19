import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import { Icon } from '@folio/stripes/components';
import {
  PluginFindRecord,
  PluginFindRecordModal,
} from '../PluginFindRecord';

import FindInstanceContainer from './FindInstanceContainer';
import reshareNormalizeRecord from './reshareNormalizeRecord';

const InstanceSearch = ({ selectInstance, renderNewBtn, endpoint, ...rest }) => (
  <PluginFindRecord
    {...rest}
    selectRecordsCb={(list) => (selectInstance(reshareNormalizeRecord(list[0])))}
  >
    {(modalProps) => (
      <FindInstanceContainer endpoint={endpoint}>
        {(viewProps) => (
          <PluginFindRecordModal
            {...viewProps}
            {...modalProps}
            isMultiSelect={false}
            renderNewBtn={renderNewBtn}
          />
        )}
      </FindInstanceContainer>
    )}
  </PluginFindRecord>
);

InstanceSearch.defaultProps = {
  searchButtonStyle: 'primary noRightRadius',
  searchLabel: <Icon icon="search" color="#fff" />,
  selectInstance: noop,
  renderNewBtn: noop,
};

InstanceSearch.propTypes = {
  searchLabel: PropTypes.node,
  searchButtonStyle: PropTypes.string,
  endpoint: PropTypes.string.isRequired,
  marginBottom0: PropTypes.bool,
  marginTop0: PropTypes.bool,
  selectInstance: PropTypes.func,
  renderNewBtn: PropTypes.func,
};

export default InstanceSearch;
