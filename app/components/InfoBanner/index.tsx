import * as React from 'react';
import I18n from 'react-light-i18n';
import { config } from '../../src/utils';

export function InfoBanner(props) {
	let bannerState = (props.bannerState) ? 'block' : 'none';

  return (
  	<div className="infoBanner" style={{ display: bannerState }}>
    	{I18n.t('infoBanner')} <pre>{config.main} {config.avatar}</pre>, <pre>{config.main} {config.title}</pre>
			<div className="infoButton" onClick={props.onClick}>{I18n.t('infoBannerButton')}</div>
    </div>
  )
}