import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';
import ApiHelper from '../api/api__helper';
import Avatar from '../avatar/avatar';
import Tags from '../tags/tags';
import {
  getAgileCardColorCoding,
  hasColorCoding,
} from '../../views/agile-board/agile-board__helper';
import {getAssigneeField} from '../issue-formatter/issue-formatter';
import {getStorageState} from '../storage/storage';
import {UNIT} from '../variables/variables';
import styles from './agile-card.styles';
import type {IssueOnList} from 'flow/Issue';
import type {
  CustomFieldShort,
  CustomField,
  CustomFieldValue,
} from 'flow/CustomFields';
import type {FieldStyle} from '../../flow/Agile';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from 'flow/Theme';
type Props = {
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
};
export const cardBottomMargin: number = UNIT * 1.5;
export const getAgileCardHeight = (): number =>
  (getStorageState().agileZoomedIn ?? true ? 110 : 50) + cardBottomMargin;

function getEstimation(
  estimationField: {
    id: string;
  },
  fields: Array<CustomFieldShort> = [],
) {
  const field = fields.filter(
    field => field.projectCustomField.field.id === estimationField.id,
  )[0];
  return field?.value?.presentation || '';
}

export default class AgileCard extends PureComponent<Props, void> {
  renderEstimation(): void | Node {
    const {issue, estimationField, zoomedIn} = this.props;

    if (!!estimationField && zoomedIn) {
      return (
        <Text style={styles.estimation} numberOfLines={1}>
          {getEstimation(estimationField, issue.fields)}
        </Text>
      );
    }
  }

  renderAssignees(): Array<
    React.ReactElement<React.ComponentProps<Avatar>, Avatar>
  > {
    const {issue} = this.props;
    const assigneeField: CustomField | null | undefined = getAssigneeField(
      issue,
    );
    const assignees: Array<CustomFieldValue> = []
      .concat(assigneeField ? assigneeField.value : null)
      .filter(Boolean);
    return assignees.map((assignee: CustomFieldValue) => {
      return (
        <Avatar
          style={styles.assignee}
          key={assignee.id}
          size={20}
          userName={assignee.name}
          source={{
            uri: assignee.avatarUrl,
          }}
          testID="card-avatar"
        />
      );
    });
  }

  render(): React.ReactNode {
    const {
      issue,
      style,
      ghost,
      dragging,
      zoomedIn,
      dropZoneWidth,
      cardWidth,
    } = this.props;
    const colorCoding: FieldStyle | null | undefined = getAgileCardColorCoding(
      issue,
      this.props.colorCoding,
    );
    const zoomedInTextStyle: ViewStyleProp | null | undefined = zoomedIn
      ? null
      : styles.zoomedInText;
    const agileCardHeight: number = getAgileCardHeight();
    const hasWidth: boolean = typeof dropZoneWidth === 'number';
    return (
      <View
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

          <View
            style={[
              styles.cardContainer,
              zoomedIn ? null : styles.cardContainerNotZoomed,
            ]}
          >
            <View style={styles.issueHeader}>
              <View style={styles.issueHeaderLeft}>
                <Text
                  style={[
                    styles.issueId,
                    issue.resolved ? styles.issueIdResolved : null,
                    zoomedInTextStyle,
                  ]}
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
              <Text
                style={styles.issueSummary}
                numberOfLines={zoomedIn ? 2 : 1}
              >
                <Text
                  testID="card-summary"
                  style={[styles.summary, zoomedInTextStyle]}
                >
                  {issue?.summary}
                </Text>
              </Text>

              {Boolean(zoomedIn && issue.tags) && (
                <Tags tags={issue.tags} style={styles.tags} multiline={true} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }
}
