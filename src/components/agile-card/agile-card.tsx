import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import Tags from 'components/tags/tags';
import {getAgileCardColorCoding, hasColorCoding} from 'views/agile-board/agile-board__helper';
import {getAssigneeField} from 'components/issue-formatter/issue-formatter';
import {getStorageState} from 'components/storage/storage';
import {UNIT} from 'components/variables';

import styles from './agile-card.styles';

import type {FieldStyle} from 'types/Agile';
import type {IssueOnList} from 'types/Issue';
import type {UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
import {CustomFieldBase, FieldValue} from 'types/CustomFields';

interface Props {
  cardWidth?: number | null | undefined;
  dragging?: boolean;
  // from <DragContainer/>
  dropZoneWidth?: number;
  // from <DragContainer/>
  estimationField?: {
    id: string;
  };
  ghost?: boolean;
  // from <Draggable/>
  issue: IssueOnList;
  style?: any;
  uiTheme: UITheme;
  zoomedIn?: boolean;
  colorCoding?: FieldStyle;
}

export const cardBottomMargin: number = UNIT * 1.5;
export const getAgileCardHeight = (): number => (getStorageState().agileZoomedIn ?? true ? 110 : 50) + cardBottomMargin;

function getEstimation(
  estimationField: {
    id: string;
  },
  fields: CustomFieldBase[] = []
) {
  const field: CustomFieldBase | undefined = fields.find(f => f.projectCustomField?.field?.id === estimationField.id);
  // @ts-ignore
  return field?.value?.presentation || '';
}

export default class AgileCard extends PureComponent<Props, void> {
  renderEstimation() {
    const {issue, estimationField, zoomedIn} = this.props;

    if (!!estimationField && zoomedIn) {
      return (
        <Text style={styles.estimation} numberOfLines={1}>
          {getEstimation(estimationField, issue.fields)}
        </Text>
      );
    }
  }

  renderAssignees() {
    const {issue} = this.props;
    const assigneeField = getAssigneeField(issue);
    const assignees: FieldValue[] = [].concat((assigneeField ? assigneeField.value : null) as any).filter(Boolean);
    return assignees.map((assignee: FieldValue) => {
      return (
        <Avatar
          style={styles.assignee}
          key={assignee.id}
          size={20}
          userName={assignee.name}
          source={{
            uri: assignee.avatarUrl,
          }}
        />
      );
    });
  }

  render() {
    const {issue, style, ghost, dragging, zoomedIn, dropZoneWidth, cardWidth} = this.props;
    const colorCoding: FieldStyle | null | undefined = getAgileCardColorCoding(issue, this.props.colorCoding);
    const zoomedInTextStyle: ViewStyleProp | null | undefined = zoomedIn ? null : styles.zoomedInText;
    const agileCardHeight: number = getAgileCardHeight();
    const hasWidth: boolean = typeof dropZoneWidth === 'number';
    return (
      <View
        testID="test:id/agileCard"
        style={[
          ghost && styles.ghost,
          {
            height: agileCardHeight,
          },
        ]}
      >
        <View
          style={[
            styles.card,
            style,
            dragging && styles.dragging,
            !!cardWidth &&
              !dragging && {
                width: cardWidth,
              },
            dragging &&
              hasWidth && {
                width: dropZoneWidth,
              },
            {
              height: agileCardHeight - cardBottomMargin,
            },
          ]}
        >
          <View
            style={[
              styles.cardColorCoding,
              hasColorCoding(colorCoding) && {
                backgroundColor: colorCoding?.background,
              },
            ]}
          />

          <View style={[styles.cardContainer, zoomedIn ? null : styles.cardContainerNotZoomed]}>
            <View style={styles.issueHeader}>
              <View style={styles.issueHeaderLeft}>
                <Text
                  style={[styles.issueId, issue.resolved ? styles.issueIdResolved : null, zoomedInTextStyle]}
                  testID="card-simple-issue-id"
                >
                  {ApiHelper.getIssueId(issue)}
                </Text>
              </View>

              {zoomedIn && (
                <View style={styles.assignees}>
                  {this.renderEstimation()}
                  {this.renderAssignees()}
                </View>
              )}
            </View>

            <View style={styles.issueContent}>
              <Text style={styles.issueSummary} numberOfLines={zoomedIn ? 2 : 1}>
                <Text testID="test:id/agileCardSummary" style={[styles.summary, zoomedInTextStyle]}>
                  {issue?.summary}
                </Text>
              </Text>

              {Boolean(zoomedIn && issue.tags) && <Tags tags={issue.tags} style={styles.tags} multiline={true} />}
            </View>
          </View>
        </View>
      </View>
    );
  }
}
