import * as React from 'react';
import I18n from 'react-light-i18n';

export function AuthPlaceholder(props) {
  return (
    <div>
      <p className="desc">
        {I18n.t('signInDesc')}
      </p>
      <button className="button button--secondary styledBtn" onClick={props.onClick}>
        {I18n.t('signIn')}
      </button>
    </div>
  );
}
