import * as React from 'react';
import I18n from 'react-light-i18n';
import { getFriends, getGroups, getByUserID, getFriendsHints } from '../../src/api';
import { Cell } from '../Cell';

export class List extends React.Component<any> {
  SECTIONS: any[] = [
    { icon: 'icon friendsHints', label: I18n.t('friendsHints'), click: () => getFriendsHints(this.props.access_token) },
    { icon: 'icon friendsRandom', label: I18n.t('friendsRandom'), click: () => getFriends(this.props.access_token, this.props.user_id, 'random') },
    { icon: 'icon friendsByName', label: I18n.t('friendsByName'), click: () => getFriends(this.props.access_token, this.props.user_id, 'name') },
    { icon: 'icon CommunityHints', label: I18n.t('communitiesHints'), click: () => getGroups(this.props.access_token, this.props.user_id, 'hints') },
    { icon: 'icon CommunityRandom', label: I18n.t('communitiesRandom'), click: () => getGroups(this.props.access_token, this.props.user_id, 'random') },
    { icon: 'icon Profile', label: I18n.t('yourProfile'), click: () => getByUserID(this.props.access_token, this.props.user_id) },
  ];

  render() {
    return (
      <div className="list">
        {this.SECTIONS.map(section => (
          <Cell
            key={section.label}
            icon={section.icon}
            name={section.label}
            onClick={section.click} />
        ))}
      </div>
    );
  }
}