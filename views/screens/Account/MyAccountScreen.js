import React, { Component } from 'react'
import { View, Text } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Toast } from "native-base"

import { Avatar } from '@components/Account/Avatar'
import Select from '@components/Form/Select3'
import FloatingLabelInput from '@components/FloatingLabelInput'
import { ButtonArrow } from '@components/Form/ButtonArrow'
import { MainLayout } from '../../layout/MainLayout'
import withStore from '../../../store/withStore'
import {auth} from '../../../services/AuthService'
import NavService from '../../../utils/navigation-service'
import { Api } from '../../../utils/Api'

class MyAccountScreen extends Component {

    state = {
        profile: {
            User: {},
            UserInfo: {},
            Company: {}
        },
        countries: {
            us: "United States",
            af: "Afghanistan",
            al: "Albania",
            dz: "Algeria",
            ad: "Andorra",
            ao: "Angola",
            ANOTHER: "Another country",
            ar: "Argentina",
            am: "Armenia",
            au: "Australia",
            at: "Austria",
            az: "Azerbaijan",
            bs: "Bahamas",
            bh: "Bahrain",
            bd: "Bangladesh",
            bb: "Barbados",
            by: "Belarus",
            be: "Belgium",
            bz: "Belize",
            bj: "Benin",
            bt: "Bhutan",
            bo: "Bolivia",
            ba: "Bosnia and Herzegovina",
            bw: "Botswana",
            br: "Brazil",
            bn: "Brunei",
            bg: "Bulgaria",
            bf: "Burkina Faso",
            bi: "Burundi",
            kh: "Cambodia",
            cm: "Cameroon",
            ca: "Canada",
            ky: "Cayman Islands",
            cf: "Central African Republic",
            td: "Chad",
            cl: "Chile",
            cn: "China",
            co: "Colombia",
            cg: "Congo",
            cr: "Costa Rica",
            ci: "Cote d'Ivoire",
            hr: "Croatia",
            cu: "Cuba",
            cy: "Cyprus",
            cz: "Czech Republic",
            dk: "Denmark",
            do: "Dominican Republic",
            ec: "Ecuador",
            eg: "Egypt",
            sv: "El Salvador",
            ee: "Estonia",
            et: "Ethiopia",
            fj: "Fiji",
            fi: "Finland",
            fr: "France",
            pf: "French Polynesia",
            ga: "Gabon",
            gm: "Gambia",
            ge: "Georgia",
            de: "Germany",
            gh: "Ghana",
            gi: "Gibraltar",
            gr: "Greece",
            gl: "Greenland",
            gd: "Grenada",
            gp: "Guadeloupe",
            gu: "Guam",
            gt: "Guatemala",
            gg: "Guernsey",
            gn: "Guinea",
            gy: "Guyana",
            ht: "Haiti",
            va: "Holy See (Vatican City State)",
            hn: "Honduras",
            hk: "Hong Kong",
            hu: "Hungary",
            is: "Iceland",
            in: "India",
            id: "Indonesia",
            ir: "Iran",
            iq: "Iraq",
            ie: "Ireland",
            im: "Isle of Man",
            il: "Israel",
            it: "Italy",
            jm: "Jamaica",
            jp: "Japan",
            je: "Jersey",
            jo: "Jordan",
            kz: "Kazakhstan",
            ke: "Kenya",
            kr: "Korea (North)",
            kp: "Korea (South)",
            kw: "Kuwait",
            kg: "Kyrgyzstan",
            lv: "Latvia",
            lb: "Lebanon",
            lr: "Liberia",
            ly: "Libya",
            li: "Liechtenstein",
            lt: "Lithuania",
            lu: "Luxembourg",
            mk: "Macedonia",
            mg: "Madagascar",
            mw: "Malawi",
            my: "Malaysia",
            mv: "Maldives",
            ml: "Mali",
            mt: "Malta",
            mr: "Mauritania",
            mu: "Mauritius",
            mx: "Mexico",
            md: "Moldova",
            mc: "Monaco",
            mn: "Mongolia",
            me: "Montenegro",
            ma: "Morocco",
            mz: "Mozambique",
            mm: "Myanmar",
            na: "Namibia",
            nr: "Nauru",
            np: "Nepal",
            nl: "Netherlands",
            nz: "New Zealand",
            ni: "Nicaragua",
            ne: "Niger",
            ng: "Nigeria",
            no: "Norway",
            om: "Oman",
            pk: "Pakistan",
            ps: "Palestinian Territory",
            pa: "Panama",
            pg: "Papua New Guinea",
            py: "Paraguay",
            pe: "Peru",
            ph: "Philippines",
            pl: "Poland",
            pt: "Portugal",
            pr: "Puerto Rico",
            qa: "Qatar",
            ro: "Romania",
            ru: "Russian Federation",
            ws: "Samoa",
            sm: "San Marino",
            sa: "Saudi Arabia",
            sn: "Senegal",
            rs: "Serbia",
            sc: "Seychelles",
            sl: "Sierra Leone",
            sg: "Singapore",
            sk: "Slovakia",
            si: "Slovenia",
            so: "Somalia",
            za: "South Africa",
            es: "Spain",
            lk: "Sri Lanka",
            sd: "Sudan",
            sr: "Suriname",
            sz: "Swaziland",
            se: "Sweden",
            ch: "Switzerland",
            sy: "Syrian Arab Republic",
            tw: "Taiwan",
            tj: "Tajikistan",
            tz: "Tanzania",
            th: "Thailand",
            tg: "Togo",
            to: "Tonga",
            tt: "Trinidad and Tobago",
            tn: "Tunisia",
            tr: "Turkey",
            tm: "Turkmenistan",
            ug: "Uganda",
            ua: "Ukraine",
            ae: "United Arab Emirates",
            gb: "United Kingdom",
            uy: "Uruguay",
            uz: "Uzbekistan",
            ve: "Venezuela",
            vn: "Vietnam",
            eh: "Western Sahara",
            ye: "Yemen",
            zm: "Zambia",
            zw: "Zimbabwe"
          },
        editableField: null,
        loading: true
    }

    async componentDidMount() {
        try {
            const profile = await auth.getUserInfo()
            this.setState({
                profile,
                loading: false
            })
        } catch {
            this.setState({
                loading: false
            })
        }
    }

    get nameSymbol() {
        const { User } = this.state.profile
        return User?.Name && User.Name.slice(0, 1);
    }

    updateField(field, key, value) {
        this.setState(prevState => {
            let profile = Object.assign({}, prevState.profile);
            profile[field][key] = value
            return { profile }
        })
    }

    onBlur() {
        this.update()
    } 

    async update() {
        let { editableField } = this.state
        if (!editableField) return
        let fieldToUpdate = `${editableField.id}___${editableField.field}`;
        let formBody = {
            [fieldToUpdate]: editableField.text
        }
        try {
            let resp = await Api.updateObjectCommand(formBody, {'Content-Type': 'application/x-www-form-urlencoded'})
            if (!!resp.data.res) this.showSnack(editableField.field)
        } catch {
            return Promise.reject(new Error('Error while field update'))
        }
    }

    async handleTextChange(target, event) {
        let path = target.split('.');
        let field = path[0]
        let itemName = path[path.length - 1]
        let itemId = this.state.profile[field].Id
        this.setState({
            editableField: {
                event: event.nativeEvent,
                field: itemName,
                id: itemId,
                text: event.nativeEvent.text
            }
        })
        this.updateField(field, itemName, event.nativeEvent.text)
    }

    handleSelectChange(target, value) {
        let path = target.split('.');
        let field = path[0]
        let itemName = path[path.length - 1]
        let itemId = this.state.profile[field].Id
        this.setState({
            editableField: {
                field: itemName,
                id: itemId,
                text: value
            }
        }, () => {
            this.update()
            this.updateField(field, itemName, value)
        })
    } 

    showSnack(field) {
        Toast.show({
            text: `${field} successfully changed`,
            buttonText: "OK",
            duration: 3000,
            style:{ backgroundColor: "#ffffff" },
            textStyle: { color: "#979797"},
            buttonTextStyle: { color: "#95BC3E"}
        })
    }

    render() {
        let { User, UserInfo, Subscription, Company } = this.state.profile
        let { loading } = this.state
        return <MainLayout
            screenColor="#31A5C5"
            loading={loading}
            nav={
                {
                    heading: "My Account",
                    right: ""
                }
            }>
            <View style={styles.avatar}>
                <View style={styles.avatar}>
                    <Avatar image={User?.Avatar?.Url} label={this.nameSymbol}/>
                </View>
                <Text style={styles.name}>{User.Name}</Text>
                <Text style={styles.email}>{User.Email}</Text>
            </View>
            <FloatingLabelInput
                label="Name"
                placeholder="Enter your name"
                value={User?.Name}
                containerStyle={{ marginBottom: 16 }}
                onChange={(e) => this.handleTextChange('User.Name', e)}
                onEndEditing={(e) => this.onBlur(e)}
                // focus={this.state.focusTaskInput}
            />
            <FloatingLabelInput
                label="Job Title"
                placeholder="Enter your job title"
                value={Company?.Job}
                containerStyle={{ marginBottom: 16 }}
                onChange={(text) => this.handleTextChange('Company.Job', text)}
                onEndEditing={(e) => this.onBlur(e)}
                // focus={this.state.focusTaskInput}
            />
            <Select
                label='Your country'
                placeholder='Your country'
                title='Choose your country'
                options={this.state.countries}
                value={UserInfo?.Country}
                onSave={(item) => this.handleSelectChange('UserInfo.Country', item)}
                // labelStyle={mainStyles.surveyLabel}
            />
            <FloatingLabelInput
                label="Company"
                placeholder="Enter your company"
                value={Company?.Name}
                containerStyle={{ marginBottom: 16 }}
                onChange={(text) => this.handleTextChange('Company.Name', text)}
                onEndEditing={(e) => this.onBlur(e)}
                // focus={this.state.focusTaskInput}
            />
            <View style={styles.bottom}>
                <ButtonArrow
                    title='Subscription'
                    onPress={() => NavService.navigate('MySubscription', { header: 'My Subscription', subscription: Subscription })}
                />
            </View>
        </MainLayout>
    }
}

export default withStore(MyAccountScreen)


const styles = EStyleSheet.create({
    avatar: {
        marginBottom: 10
    },
    name: {
        fontSize: 24,
        fontFamily: 'ProximaRegular',
        color: '#ffffff'
    },
    email: {
        fontSize: 14,
        fontFamily: 'ProximaRegular',
        color: '#DADADA'
    },
    avatar: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20
    },
    bottom: {
        marginTop: 40
    }
  })