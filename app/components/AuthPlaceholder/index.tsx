import * as React from 'react';
import I18n from 'react-light-i18n';

export function AuthPlaceholder(props) {
  let displaySpinner = (props.loadingState) ? 'block' : 'none';
  let displayBtn = (props.loadingState) ? 'none' : 'block';
  console.log(props.loadingState);

  return (
    <div>
      <p className="desc">
        {I18n.t('signInDesc')}
      </p>
      <button className="button button--secondary styledBtn" onClick={props.onClick} style={{ display: displayBtn }}>
        {I18n.t('signIn')}
      </button>
      <div className="spinner" style={{ display: displaySpinner }}>{I18n.t('loading')}</div>
    </div>
  );
}
