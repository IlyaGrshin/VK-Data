import * as React from 'react';
import I18n from 'react-light-i18n';

export function Logout(props) {
  return (
    <div className="logout" onClick={props.onClick}>
      {I18n.t('logout')}
    </div>
  );
}