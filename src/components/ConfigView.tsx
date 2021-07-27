import {Theme} from '@material-ui/core/styles/createMuiTheme'
import {StyleRules} from '@material-ui/core/styles/withStyles'
import withStyles from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import toPairs from 'lodash/toPairs'
import * as React from 'react'
import { IHashBoxConfig, IProfile } from '../@types/Config'
import { WithStyleProps } from '../@types/Styles'

type Props = {
  profile: IProfile,
  hashBoxConfig: IHashBoxConfig,
} & WithStyleProps

type State = {
}

const styles = (theme: Theme) => ({
  textField: {
    width: '100%',
  },
}) as StyleRules

class ConfigView extends React.Component<Props, State> {

  public renderObject = (obj: any) => {
    const { classes } = this.props
    const pairs = toPairs(obj)

    return pairs.map((pair:[string, any]) => {
      const label = pair[0].replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
      const value = pair[1].toString()

      return <TextField
        key={pair[0]}
        type='text'
        label={label}
        value={value}
        className={classes.textField}
        InputProps={{
          readOnly: true,
        }} />
    })
  }

  public render() {
    return (
      <div>
        {this.renderObject(this.props.hashBoxConfig)}
        {this.renderObject(this.props.profile)}
      </div>
    )
  }
}

export default withStyles(styles)(ConfigView)
