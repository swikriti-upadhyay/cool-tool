import React, { Component } from 'react'
import { Button, Text } from 'native-base'
import { View, PixelRatio, BackHandler } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import Constants from '../../constants'

import NavService from '../../utils/navigation-service'
import StyleService from '../../utils/style-service'

import {mainStyles, normalizeFont} from '../../styles'
import {Storages} from '../../storage/data-storage-helper'

import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'

 
const Nav = () => {
    return(
        <Navigation
            heading="Terms & Conditions"
        />
    )
}

export default class TermsScreen extends Component {

    state = {
        canPressButton: false
    }

  getStyle(){
    let baseStyles = styles
    if (StyleService.viewMode === 'landscape') {
      return {...baseStyles, ...landscapeStyles};
    } else {
      return baseStyles;
    }
  }


  async handleAccept() {
      let settings = await Storages.SettingsStorage.getSettings()
      let action = this.props.navigation.getParam('replace', "Login");
      settings.terms = true
      await Storages.SettingsStorage.update(settings)
      NavService.replace(action)
  }

  closeApp() {
    BackHandler.exitApp();
  }

  scrollChangeHeading({layoutMeasurement, contentOffset, contentSize}) {
    const scrollHeight = 50;
    return contentOffset.y > scrollHeight
  }

  enableAccept() {
      this.setState({
          canPressButton: true
      })
  }

  renderFooter = () => {
    //   let accept = this.props.navigation.getParam('accept')
        return(
            <View style={[{ flexDirection:'row', justifyContent: 'space-between'}]}>
                <Button
                  style={[styles.btn, styles.decline, !this.state.canPressButton && styles.decline_disabled]}
                  light
                  onPress={()=>this.closeApp()}
                  disabled={!this.state.canPressButton}>
                    <Text style={[styles.btnText, { color: '#fff'}]}>DECLINE</Text>
                    <Text style={styles.small_text}>and exit the app</Text>
                </Button>
                <Button
                  style={[styles.btn, styles.accept, !this.state.canPressButton && styles.accept_disabled]}
                  light
                  onPress={()=>this.handleAccept()}
                  disabled={Constants.isDebug ? false : !this.state.canPressButton}>
                    <Text style={[styles.btnText, { color: '#95BC3E'}]}>ACCEPT</Text>
                    <Text style={[styles.small_text, { color: '#95BC3E'}]}>and continue</Text>
                </Button>
            </View>
        )
    }

    get showButtons() {
        return this.props.navigation.getParam('showButtons', true)
    }

  render() {
    return (
            <Layout 
                navigation={<Nav />}
                contentStyle={this.getStyle().contentWrap}
                fixedFooter={ this.showButtons && this.renderFooter() }
                scrollHandler={(nativeEvent)=> {
                    if (this.scrollChangeHeading(nativeEvent)) {
                        this.enableAccept()
                      }
                }}>
                    <Text style={styles.heading}>Terms of Use</Text>
                    <Text style={styles.heading}>1. Agreement to Terms of Use</Text>
                    <Text style={styles.paragraph}>Please read this document carefully. Set forth below are the legal terms and conditions under which CoolTool Inc. (“CoolTool”, “We,” “Our” or “Us”) has developed UXReality platform available at https://www.uxreality.com, UXReality mobile application, CoolTool platform available at https://cooltool.com, NeuroLab desktop application and provides other services available with the use of these products (together “Products”, “Services”) available to individuals and corporate entities (“Users”) accessing or using the Services.</Text>
                    <Text style={styles.paragraph}>The Products are the property of CoolTool and our licensors. By accessing or using the Services you agree to be bound by these Terms. If you disagree with any part of the Terms, then you do not have permission to access the Services. In addition, our Privacy Policy explains how we treat your personal data and protect your privacy when you use our Products and Services. By using our Products and Services, you agree that We can use such data in accordance with our Privacy Policy.</Text>
                    <Text style={styles.paragraph}>We reserve the right, in our sole discretion, to change, modify, add or remove portions of these Terms of Use, at any time. It is your responsibility to check these Terms of Use periodically for changes. Your continued use of the Products following the posting of changes will mean that you accept and agree to the changes. If any modification is unacceptable to you, you shall cease using our Products and Services. If you do not cease using our Products and Services, you will be conclusively deemed to have accepted the change.</Text>
                    <Text style={styles.paragraph}>Each User hereby warrants that if it is a corporation or other legal entity, User is validly formed and existing under the laws of its jurisdiction and has duly authorized its agent or agents to enter into this Agreement and, if an individual, User is of the age of majority in his or her place of residence.</Text>
                    <Text style={styles.heading}>2. Content</Text>
                    <Text style={styles.paragraph}>User acknowledges and agrees that:</Text>
                    <Text style={styles.list_item}>1. all survey questions, information, data, text, software, music, sound, photographs, images, video, survey responses, messages or other materials communicated or transmitted using the Products or Services (“Content”), whether publicly posted or privately transmitted, are the sole responsibility of the person from whom such Content originated;</Text>
                    <Text style={styles.list_item}>2. User, and not Us, is responsible for all Content that User uploads, posts, emails, distributes, communicates, transmits, or otherwise makes available using the Services or that is otherwise made available through the use of User’s account (if User has one), whether or not authorized by User;</Text>
                    <Text style={styles.list_item}>3. by using the Products and Services, User may be exposed to Content that is unlawful, harmful, threatening, abusive, harassing, tortuous, defamatory, libelous, vulgar, obscene, offensive, indecent, invasive of another’s privacy, hateful, or racially, ethnically or otherwise objectionable.</Text>
                    <Text style={styles.paragraph}>User further acknowledges and agrees that We do not control the Content originating from User, respondents to User’s survey, or other users of Products or Services, and does not guarantee the accuracy, integrity or quality of such Content. Notwithstanding the foregoing, We may review all Content and may block, modify, terminate access to, or remove any such Content that We determine, in our sole discretion, does not comply with any of the requirements of these Terms, but We are not obligated to do so.</Text>
                    <Text style={styles.paragraph}>We reserve the right to purge Content from our databases at any time and from time to time without notice. User acknowledges and agrees that User is solely responsible for backing up any Content uploaded to the Products by User or received by User through the use of the Services. We shall not be liable for any purging, deletion, or failure to retain any such Content.</Text>
                    <Text style={styles.paragraph}>We may disable User’s account and User’s access to use the Products or Services and may recover from User any losses, damages, costs or expenses incurred by using our Services resulting from or arising out of User’s non-compliance with these Terms.</Text>
                    <Text style={styles.heading}>3. Registration; Your Passwords and Unauthorized Use of Your Account</Text>
                    <Text style={styles.paragraph}>In order to use the Products or Services, you may be required to provide information about yourself (such as identification or contact details) as part of the registration process. You agree that any registration information you give to Us will be accurate, correct, and current. You agree and understand that you are responsible for maintaining the confidentiality of the password(s) you use to access the Products and Services. Accordingly, you agree that you will be solely responsible for all activities that occur under your accounts, and will be responsible for any breach of these Terms caused by such activities. If you become aware of any unauthorized use of your password or of your account, you agree to notify Us immediately.</Text>
                    <Text style={styles.heading}>4. Fees</Text>
                    <Text style={styles.paragraph}>You agree to pay any fees for the Services you purchase or use, in accordance with the pricing and payment terms presented to you for the Services.</Text>
                    <Text style={styles.paragraph}>Some parts of the Services are billed on a subscription basis (“Subscription”). Each Subscription will have a definite expiration date that will be determined in the purchase order.</Text>
                    <Text style={styles.paragraph}>A valid payment method (credit card, PayPal, wire transfer etc.) is required to process the payment. You shall provide Us with accurate and complete billing information including full name, address, state, zip code, telephone number, and a valid payment method information. By submitting such payment information, you automatically authorize CoolTool Inc. to charge the confirmed amount from your credit card or PayPal through our payment gateway provider.</Text>
                    <Text style={styles.paragraph}>Unless otherwise stated, you are responsible for any taxes or duties associated with the sale of the Services, including any related penalties or interest. You will pay Us for the Services without any reduction for taxes.</Text>
                    <Text style={styles.paragraph}>We may change the fees charged for the Services at any time, provided that, for Services billed on a subscription basis, the change will become effective only after the expiration date of the current Subscription.</Text>
                    <Text style={styles.heading}>5. User Content</Text>
                    <Text style={styles.paragraph}>In connection with User’s use of the Products and Services, and without limiting any of User’s other obligations under these Terms or applicable law, User:</Text>
                    <Text style={styles.list_item}>1. shall comply with: (i) these Terms, including our anti-spam policy (set forth below) and all other policies as published within our Products from time to time, (ii) all applicable U.S. Federal, state, local and international laws, including the CAN-SPAM Act of 2003, and all other laws related to unsolicited commercial email messages, defamation, privacy, obscenity, intellectual property or child protective email address registries, (iii) all other rules or regulations applicable to User, including regulations promulgated by the U.S. Securities and Exchange Commission and similar regulatory authorities throughout the world, and the rules of any securities exchange, and (iv) all privacy policies or similar policies or procedures to which User may be bound that are related to User’s use of the Services;</Text>
                    <Text style={styles.list_item}>2. shall not upload, post, email, distribute, communicate, transmit or otherwise make available any Content: (i) that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, libelous, vulgar, obscene, offensive, indecent, invasive of another’s privacy, hateful, or racially, ethnically or otherwise objectionable, (ii) that infringes any patent, trademark, trade secret, copyright, or other intellectual property right of any party, (iii) that User does not have the right to make available by reason of any law or contractual or fiduciary relationship (including inside information, and proprietary or confidential information obtained or disclosed in connection with an employment relationship or pursuant to a confidentiality agreement), or (iv) that comprises or includes any “junk mail”, “spam”, “chain letters”, “pyramid schemes”, or any similar form of solicitation;</Text>
                    <Text style={styles.list_item}>3. shall not use the Products or Services to send surveys, polls, or other materials to minors unless User is permitted to do so under all applicable laws, or to harm minors in any way, and shall not send surveys, polls or other materials to minors that would subject Us to the Children’s Online Privacy and Protection Act;</Text>
                    <Text style={styles.list_item}>4. shall not impersonate any other person or entity, including Us or our official, employee, forum leader, guide or host, or falsely state or otherwise misrepresent User’s affiliation with any other person or entity;</Text>
                    <Text style={styles.list_item}>5. shall, if User uses the Services to send a survey, not mislead the recipients of that survey that User may have the ability to associate individual responses to that survey with the individual email addresses to which that survey was sent by stating that User has no such ability (unless User has requested Us to disable such feature). We recommend that Users’ surveys include the following notice (or words to similar effect), if applicable: “Please be advised that your responses to this survey may not be treated as anonymous by the survey sender”;</Text>
                    <Text style={styles.list_item}>6. shall not interfere with or disrupt the Products or Services or servers or networks connected to the Products or Services, or disobey any requirements, procedures, policies, or regulations of networks connected to the Products or Services;</Text>
                    <Text style={styles.list_item}>7. shall not engage in excessive usage of the Products and Services, as determined by Us in its sole discretion, including usage that adversely affects the speed, responsiveness, or functionality of the Products, or disrupts the availability of the Products and Services for other Users;</Text>
                    <Text style={styles.list_item}>8. shall not attempt to damage, deny service to, hack, crack, reverse engineer, or otherwise interfere with the operation of the Products or Services in any manner;</Text>
                    <Text style={styles.list_item}>9. shall not upload, post, email, distribute, communicate, transmit or otherwise make available any viruses or similar malicious software that may damage the operation of a computer, the Products, or the Services;</Text>
                    <Text style={styles.list_item}>10. shall not upload survey links to message boards or newsgroups that are not relevant to the subject matter of the survey, or that prohibit such uploading without our prior written consent;</Text>
                    <Text style={styles.list_item}>11. shall not use the Products and Services to collect, process, or otherwise handle, “Protected Health Information” (as defined in 45 C.F.R. § 160.103) without our prior written consent. User further acknowledges and agrees that We may cooperate with any governmental authority in connection with any investigation into User’s use of the Products or Services, including use in contravention of applicable laws, and may disclose any Content, and any other information pertaining to the User or to User’s use of the Products or Services, to such governmental authority in connection with any such investigation.</Text>
                    <Text style={styles.heading}>6. Anti-Spam Policy</Text>
                    <Text style={styles.paragraph}>We do not allow our clients to use our Products to send SPAM. We respect the choices of users on which emails they wish to receive. Email messages sent by Us and in connection with our surveys contain an “unsubscribe” link that allows users to elect not to receive further such messages. In case of suspicion that We have been used by someone to send SPAM, users can contact Us and We will investigate the matter.</Text>
                    <Text style={styles.heading}>7. Submissions</Text>
                    <Text style={styles.paragraph}>Any inquiries, feedback, suggestions or ideas you provide to Us (collectively, “Submissions”) will be treated as non-proprietary and non-confidential. Subject to the terms of our Privacy Policy, by transmitting or posting any Submission, you hereby grant Us a nonexclusive, royalty-free, perpetual, transferable, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, sell, assign, translate, create derivative works from, distribute, and display any Submission in any form, media, or technology, whether now known or hereafter developed, alone or as part of other works. You also acknowledge that We may use your Submission, and any ideas, concepts or know how contained therein, for any purpose. If you make a Submission, you represent and warrant that you own or otherwise control the rights to your Submission and that such Submission does not infringe the rights of any third party. You further represent and warrant that such Submission does not constitute or contain software viruses, commercial solicitation, chain letters, mass mailings, or any form of “spam”. You may not use a false email address, impersonate any person or entity, or otherwise mislead us as to the origin of any Submission. You agree to indemnify Us for all claims arising from your Submission.</Text>
                    <Text style={styles.heading}>8. Linked Websites</Text>
                    <Text style={styles.paragraph}>We do not review or monitor any websites linked to the Products and is not responsible for the content of any such linked websites. Your use of such linked websites is at your own risk. In addition, the existence of a link between the Products and another website shall not constitute the endorsement by CoolTool (or our parents, subsidiaries or affiliates) of the owner or proprietor of such linked website or of any products or services of such owner or proprietor, nor shall it constitute an endorsement by the owner or proprietor of such linked website of CoolTool, our parents, subsidiaries or affiliates.</Text>
                    <Text style={styles.heading}>9. Right to Modify our Products and Services</Text>
                    <Text style={styles.paragraph}>We may from time to time, in our sole discretion, change some or all of the functionality or any component of the Products or Services or make any modification for any purpose including but not limited to improving the performance, service quality, error correction or to maintain the competitiveness of the Products or Services.</Text>
                    <Text style={styles.heading}>10. Termination</Text>
                    <Text style={styles.paragraph}>Agreement to these Terms shall automatically become effective upon User’s first use of the Products or Services and upon acceptance of this Agreement, and will continue until it is terminated. Customer may terminate this Agreement at any time for any reason by providing written notice to Us. We reserve the right to suspend or terminate your account and use of the Products or Services, at any time, without notice, for any reason, at our sole discretion, including but not limited to the following:</Text>
                    <Text style={styles.list_item}>1. if any check drafts authorized under these Terms are returned unpaid;</Text>
                    <Text style={styles.list_item}>2. if you use the Products in connection with phishing attempts or schemes;</Text>
                    <Text style={styles.list_item}>3. if you are involved in the sales and/or distribution of the following materials: Ponzi or Pyramid Schemes;</Text>
                    <Text style={styles.list_item}>4. sale and/or distribution of any illegal materials;</Text>
                    <Text style={styles.list_item}>5. breach of these Terms, including policies or guidelines set forth by Us elsewhere;</Text>
                    <Text style={styles.list_item}>6. conduct that We believe is harmful to other users of the Products or Services or our business or other third party information providers (including slowing down the servers and affecting other users).</Text>
                    <Text style={styles.paragraph}>Upon termination of this Agreement for any reason, User shall immediately cease all use of the Products and Services, and User acknowledges and agrees that We may, in our sole discretion, take any measures We reasonably deem necessary or desirable to prevent further use by User of the Products or Services, including by blocking User’s IP address. User further acknowledges and agrees that upon the termination of this Agreement, We shall not be obliged to retain any User Content (including survey or poll results or responses) or to provide the same to User, but may elect to do so in our sole discretion.</Text>
                    <Text style={styles.paragraph}>Termination of this Agreement by Us as provided for in these Terms shall not entitle User to a refund of any unearned Subscription fees previously paid by User.</Text>
                    <Text style={styles.paragraph}>Sections 5, 8, 9, 10, 11, 12, 14 and 16 of these Terms will survive termination and shall continue to apply indefinitely.</Text>
                    <Text style={styles.heading}>11. WARRANTY DISCLAIMER</Text>
                    <Text style={styles.paragraph}>CUSTOMER UNDERSTANDS THAT WE DO NOT GUARANTEE OR PREDICT ANY TYPE OF PROFIT OR RESPONSE FROM OUR PRODUCTS OR SERVICES. THE PRODUCTS AND ALL SERVICES ARE PROVIDED “AS IS” AND USER AGREES THAT IT USES THE PRODUCTS AND SERVICES AT ITS OWN RISK. USER ACKNOWLEDGES AND AGREES THAT WE AND OUR SUPPLIERS MAKE NO WARRANTY, EXPRESS, STATUTORY OR IMPLIED, OF ANY KIND TO CUSTOMER UNDER THIS AGREEMENT, INCLUDING ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND/OR NON-INFRINGEMENT.</Text>
                    <Text style={styles.paragraph}>WE DO NOT REPRESENT OR WARRANT THAT:</Text>
                    <Text style={styles.list_item}>1. THE PRODUCTS OR SERVICES WILL MEET CUSTOMER’S BUSINESS REQUIREMENTS</Text>
                    <Text style={styles.list_item}>2. THE PRODUCTS OR SERVICES WILL BE ERROR-FREE OR UNINTERRUPTED OR THAT THE RESULTS OBTAINED FROM THE USE OF THE PRODUCTS AND/OR SERVICES WILL BE ACCURATE OR RELIABLE</Text>
                    <Text style={styles.list_item}>3. ALL DEFICIENCIES IN THE PRODUCTS OR SERVICES CAN BE FOUND OR CORRECTED. FURTHER, THE PRODUCTS OR THE SERVICES MAY BE INTERRUPTED OR UNAVAILABLE FOR THE PURPOSES OF PERFORMING MAINTENANCE OR UPGRADES.</Text>
                    <Text style={styles.paragraph}>WE WILL NOT BE RESPONSIBLE FOR:</Text>
                    <Text style={styles.list_item}>1. SERVICE IMPAIRMENTS CAUSED BY ACTS WITHIN THE CONTROL OF YOU OR ANY OTHER USER</Text>
                    <Text style={styles.list_item}>2. INOPERABILITY OF SPECIFIC CUSTOMER APPLICATIONS OR EQUIPMENT</Text>
                    <Text style={styles.list_item}>3. INABILITY OF CUSTOMER TO ACCESS OR INTERACT WITH ANY OTHER SERVICE PROVIDER THROUGH THE INTERNET, OTHER NETWORKS OR USERS THAT COMPRISE THE INTERNET OR THE INFORMATIONAL OR COMPUTING RESOURCES AVAILABLE THROUGH THE INTERNET</Text>
                    <Text style={styles.list_item}>4. INTERACTION WITH OTHER SERVICE PROVIDERS, NETWORKS, USERS OR INFORMATIONAL OR COMPUTING RESOURCES THROUGH THE INTERNET</Text>
                    <Text style={styles.list_item}>5. SERVICES PROVIDED BY OTHER SERVICE PROVIDERS</Text>
                    <Text style={styles.list_item}>6. PERFORMANCE IMPAIRMENTS CAUSED ELSEWHERE ON THE INTERNET.</Text>
                    <Text style={styles.heading}>12. LIMITATION OF LIABILITY</Text>
                    <Text style={styles.paragraph}>EXCEPT WHERE PROHIBITED BY LAW, IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</Text>
                    <Text style={styles.paragraph}>WE SHALL NOT BE LIABLE FOR UNAUTHORIZED ACCESS TO OR ALTERATION, THEFT, LOSS OR DESTRUCTION OF ANY DATA, EQUIPMENT OR OUR SERVICES, INCLUDING WITHOUT LIMITATION THROUGH ACCIDENT, FRAUDULENT MEANS OR DEVICES, OR ANY OTHER METHOD.</Text>
                    <Text style={styles.paragraph}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER US NOR ANY OF OUR PARENTS, SUBSIDIARIES, AFFILIATES, AGENTS, EMPLOYEES, REPRESENTATIVES, OR LICENSORS SHALL BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL, PUNITIVE, INCIDENTAL, EXEMPLARY, CONSEQUENTIAL OR OTHER DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE USE (OR INABILITY TO USE) THE PRODUCTS OR SERVICES, THE FAILURE OF PERFORMANCE OF THE PRODUCTS OR SERVICES FOR ANY REASON, OR THE USE OF THE INFORMATION OR MATERIALS AVAILABLE FROM OR THROUGH THE PRODUCTS OR SERVICES.</Text>
                    <Text style={styles.heading}>13. Indemnity</Text>
                    <Text style={styles.paragraph}>You agree to defend, indemnify and hold Us harmless from and against any loss, damages or costs, including reasonable attorneys’ fees and disbursements, resulting from any claim, action, or demand resulting from your use of the Services. You also agree to indemnify Us for any loss, damages, or costs, including reasonable attorneys’ fees and disbursements, resulting from your use of software robots, spiders, crawlers, or similar data gathering and extraction tools, or any other action you take that imposes an unreasonable burden or load on our infrastructure.</Text>
                    <Text style={styles.heading}>14. Intellectual Property Rights</Text>
                    <Text style={styles.paragraph}>The Products and Services and all information, including documents, services, site design, text, graphics, logos, images, and icons, as well as the arrangement thereof, are the sole property of CoolTool, our affiliates, or our third-party licensors. Except as otherwise required or limited by applicable law, any reproduction, distribution, modification, retransmission, or publication of any copyrighted material is strictly prohibited without our written consent. We reserve all rights in the Products and Services that are not expressly granted.</Text>
                    <Text style={styles.paragraph}>UXReality is a trademark of CoolTool. Other trademarks, names, and logos within the Products are the property of their respective owners. Nothing in this Agreement shall be deemed to assign or transfer to User any rights to any such intellectual property. User further acknowledges and agrees that our materials and other content made available to User through the Services may be subject to the intellectual property rights of third parties.</Text>
                    <Text style={styles.heading}>15. License</Text>
                    <Text style={styles.paragraph}>We give you a worldwide, non-assignable and non-exclusive license to use the Products and Services for your personal, non-commercial use on the terms and conditions described in these Terms of Use. This license is for the sole purpose of enabling you to use and enjoy the benefit of the Products or Services as provided by Us, in the manner permitted by the Terms of Use.</Text>
                    <Text style={styles.heading}>16. Governing Law and Venue; Arbitration</Text>
                    <Text style={styles.paragraph}>These Terms of Use and anything contained within our Products shall be governed by, and construed and enforced in accordance with, the laws of the State of New York, giving no effect to its conflicts of law principles. Any dispute relating in any way to your use of the Products or Services shall be submitted to confidential arbitration in New York, except that, to the extent you have in any manner violated or threatened to violate our intellectual property rights, we may seek injunctive or other appropriate relief in New York, and you consent to exclusive jurisdiction and venue in such courts. Arbitration under this agreement shall be conducted under the rules then prevailing of the American Arbitration Association. The arbitrator’s award shall be binding and may be entered as a judgment in any court of competent jurisdiction. To the fullest extent permitted by applicable law, no arbitration under this Agreement shall be joined to an arbitration involving any other party subject to this Agreement, whether through class arbitration proceedings or otherwise.</Text>
                    <Text style={styles.heading}>17. Copyright Infringement</Text>
                    <Text style={styles.paragraph}>If you are the owner of any copyrighted work and believe your rights under U.S. copyright law have been infringed by any material within our Products, you may take advantage of certain provisions of the Digital Millennium Copyright Act (the “DMCA”) by sending our authorized agent a notification of claimed infringement that satisfies the requirements of the DMCA. Upon our receipt of a satisfactory notice of a claimed infringement, We will respond expeditiously either directly or indirectly (i) to remove the allegedly infringing work(s) accessible through our Products or (ii) to disable access to the work(s). It is our policy in accordance with the DMCA and other applicable laws to reserve the right to terminate access to our Products (or any part of thereof) for any user who is either found to infringe third party copyright or other intellectual property rights, including repeat infringers, or who We, in our sole discretion, believes is infringing these rights. We may terminate access to the Products or Services at any time with or without notice for any affected User. If the affected user believes in good faith that the allegedly infringing works have been removed or blocked by mistake or misidentification, then that user may send a counter-notification to Us. Upon our receipt of a counter-notification that satisfies the requirements of DMCA, We will provide a copy of the counter-notification to the person who sent the original notification of the claimed infringement and will follow the DMCA’s procedures with respect to a received counter-notification. In all events, you expressly agree that We will not be a party to any disputes or lawsuits regarding alleged copyright infringement.</Text>
                    <Text style={styles.heading}>To File a Notification:</Text>
                    <Text style={styles.paragraph}>Written notification must be made. This can be done either by fax or written letter (regular mail or courier). Emails will not be accepted unless a prior arrangement has been made. The notification must:</Text>
                    <Text style={styles.list_item}>1. identify in sufficient detail the copyrighted work that you believe has been infringed upon (i.e., describe the work that you own);</Text>
                    <Text style={styles.list_item}>2. identify the material that you claim is infringing on your copyright, and provide information reasonably sufficient to locate such material;</Text>
                    <Text style={styles.list_item}>3. provide a reasonably sufficient method of contacting you; phone number and email address would be preferred;</Text>
                    <Text style={styles.list_item}>4. provide information, if possible, sufficient to permit us to notify the user(s) who posted the content that allegedly contains infringing material. You may also provide screenshots or other materials that are helpful to identify the works in question (this is for identification only, not to “prove” substantive claims);</Text>
                    <Text style={styles.list_item}>5.include the following statement: “I have good faith belief that the use of the copyrighted materials described above and contained on the service is not authorized by the copyright owner, its agent, or by the protection of the law.”;</Text>
                    <Text style={styles.list_item}>6. include the following statement: “I swear, under penalty of perjury, that the information in the notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.”;</Text>
                    <Text style={styles.list_item}>7. sign the notice.</Text>
                    <Text style={styles.paragraph}>Please note: The DMCA provides that you may be liable for damages (including costs and attorneys’ fees) if you falsely claim that an in-world item is infringing your copyrights. We recommend contacting an attorney if you are unsure whether an in-world object is protected by copyright laws.</Text>
                    <Text style={styles.paragraph}>Send the written document to the designated Copyright Agent at UXReality:</Text>
                    <Text style={styles.list_item}>UXReality Inc.</Text>
                    <Text style={styles.list_item}>Attn: Designated Copyright Agent</Text>
                    <Text style={styles.list_item}>1390 Market Street, Suite 200</Text>
                    <Text style={styles.list_item}>San Francisco, CA 94102</Text>
                    <Text style={styles.paragraph}>Alternatively, fax the document to 415-954-8598. On the cover sheet, please write ATTN: DMCA NOTIFICATION</Text>
                    <Text style={styles.heading}>To file a counter-notification:</Text>
                    <Text style={styles.list_item}>1. list the items that were removed by us and the location at which the material appeared before it was removed. Please identify the materials in sufficient detail, and when possible, provide the URL;</Text>
                    <Text style={styles.list_item}>2. provide your name, address, telephone number, email address (if available);</Text>
                    <Text style={styles.list_item}>3. state that you consent to the jurisdiction of Federal District Court for the judicial district in which you reside (or San Francisco, California if your address is outside of the United States);</Text>
                    <Text style={styles.list_item}>4. state that you will accept service of process from the person who provided notification to us of the alleged infringement or an agent of such person;</Text>
                    <Text style={styles.list_item}>5. state the following: “I swear, under penalty of perjury, that I have a good faith belief that the material identified above was removed or disabled as a result of a mistake or misidentification of the material to be removed or disabled.”;</Text>
                    <Text style={styles.list_item}>6. sign the counter-notice.</Text>
                    <Text style={styles.paragraph}>Send the written document to the designated Copyright Agent at UXReality:</Text>
                    <Text style={styles.list_item}>UXReality Inc.</Text>
                    <Text style={styles.list_item}>Attn: Designated Copyright Agent</Text>
                    <Text style={styles.list_item}>1390 Market Street, Suite 200</Text>
                    <Text style={styles.paragraph}>Alternatively, fax the document to 415-835-9433. On the cover sheet, please write ATTN: DMCA COUNTER-NOTIFICATION</Text>
                    <Text style={styles.heading}>18. Miscellaneous</Text>
                    <Text style={styles.paragraph}>You acknowledge and agree that these Terms of Use constitute the complete and exclusive agreement between us concerning your use of the Products and Services, and supersede and govern all prior proposals, agreements, or other communications. We may, with or without prior notice, terminate any of the rights granted by these Terms. You shall comply immediately with any termination or other notice, including, as applicable, by ceasing all use of the Products. Nothing contained in these Terms shall be construed as creating any agency, partnership, or other forms of joint enterprise between us. Our failure to require your performance of any provision hereof shall not affect our full right to require such performance at any time thereafter, nor shall our waiver of a breach of any provision hereof be taken or held to be a waiver of the provision itself. In the event that any provision of these Terms shall be unenforceable or invalid under any applicable law or be so held by any applicable court decision, such unenforceability or invalidity shall not render these Terms unenforceable or invalid as a whole. We will amend or replace such provision with one that is valid and enforceable and which achieves, to the extent possible, our original objectives and intent as reflected in the original provision.</Text>
                    <Text style={styles.heading}>Privacy Policy</Text>
                    <Text style={styles.paragraph}>The following sets forth the policies for the collection and use of personally identifiable information by CoolTool Inc. (“CoolTool”, “We”, “Our” or “Us”). It applies to all products, services, websites, and applications (“Products” or “Services”) offered by CoolTool and supersedes any previous statement of such policies. We take our obligations regarding privacy very seriously and want to ensure users are fully informed about the information they are providing to us.</Text>
                    <Text style={styles.paragraph}>In this Privacy Policy references to “Data” or “Information” will refer to any information that can exist or be created while using our Services. References to “Personal Information” will refer to any information related to an identifiable data subject and may include, but is not limited to, your name, postal address, email, telephone number, date of birth, age, gender, payment information, social media account information, referring site, and other technical information collected by our servers.</Text>
                    <Text style={styles.heading}>Data Subjects</Text>
                    <Text style={styles.paragraph}>This Privacy Policy is relevant to various data subjects that were divided into several groups (collectively “Users”):</Text>
                    <Text style={styles.list_item}>• Project Owners – people engaged either directly or indirectly in creating questionnaires, data collection and analysis of results.</Text>
                    <Text style={styles.list_item}>• Respondents – persons invited to participate in a survey created with the use of our Services.</Text>
                    <Text style={styles.list_item}>• Website Visitors – individuals visiting one of our websites.</Text>
                    <Text style={styles.paragraph}>The scope of information that we collect and use is different for each group of Users.</Text>
                    <Text style={styles.heading}>Collection and Use of Information</Text>
                    <Text style={styles.paragraph}>Below is the description of major types of information that we may collect and use:</Text>
                    <Text style={styles.list_item}>• Contact Information – your name, email, telephone number, country, the company you work for, etc. This information is mainly collected when completing the registration form and any other form on our websites and used to identify you and communicate with you.</Text>
                    <Text style={styles.list_item}>• Billing Information – credit card or bank account details, address, etc. This information is mainly collected when making a payment for our Services and used to process payment transactions.</Text>
                    <Text style={styles.list_item}>• Contact Lists – contacts you may use to invite people to participate in your survey. This information is mainly collected when a project owner downloaded it to our websites and used solely for the purpose of inviting respondents to take part in a survey. We don’t use this information for our own purposes.</Text>
                    <Text style={styles.list_item}>• Biometric Data – data recorded by hardware (camera, microphone or others) which can be represented by photographs, videos, data sets, audio records etc. This data is collected when respondents participate in a survey. Some biometric data may be classified as Personal Information. Data collected with the use of the camera is not available for project owners in its original form. It is stored and used for the purpose of providing our Services</Text>
                    <Text style={styles.list_item}>• Screen Recordings - recordings of screen output also containing audio narration and taps on the screen. This data is collected when respondents participate in a website or app testing with the use of UXReality. It is stored and used for the purpose of providing our Services and is available for project owners for review.</Text>
                    <Text style={styles.list_item}>• Project Data – questionnaires, data collectors, reports, data received from respondents and other project related data. This information is mainly used for the purpose of providing and improving our Services and to provide support for our users.</Text>
                    <Text style={styles.list_item}>• Log Data – information that your browser or application sends us whenever you use our Services. It may include information such as your computer’s Internet Protocol (“IP”) address, browser type, browser version, the actions you made while using our Services, the time and date of those actions, etc. This information is mainly used for the purpose of providing and improving our Services and to provide support for our users.</Text>
                    <Text style={styles.list_item}>• Cookies – files with a small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a website and transferred to your device. We use cookies to collect information in order to improve our services for you. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. The Help feature on most browsers provides information on how to accept cookies, disable cookies or to notify you when receiving a new cookie. If you do not accept cookies, you may not be able to use some features of our Services and we recommend that you leave them turned on.</Text>
                    <Text style={styles.paragraph}>We may also use machine learning techniques with regard to some data for the purpose of providing and improving our Services.</Text>
                    <Text style={styles.paragraph}>Project owners may share data collected with the use of our Services with other users, export this data and use it in their own discretion. Project owners are responsible for the collection and storage of respondents’ consent to collect and use Personal Information related to them. We do control data received from respondents and are not in a position to directly handle requests from respondents related to management and access to such data. If you are a respondent and you’re having difficulties finding the needed project owner, you can contact our support team and we will do our best to help you out.</Text>
                    <Text style={styles.paragraph}>To exercise your rights related to Personal Information provided by you to us, submit your request to privacy@cooltool.com. We will respond to your request within a reasonable time.</Text>
                    <Text style={styles.heading}>Service Providers</Text>
                    <Text style={styles.paragraph}>We may cooperate with third party companies and individuals to facilitate our Services, to provide Services on our behalf, to perform related services and/or to assist us in analyzing how our Services are used. In particular, we engage service providers to:</Text>
                    <Text style={styles.list_item}>• sending survey invitations by email to respondents;</Text>
                    <Text style={styles.list_item}>• process credit card payments;</Text>
                    <Text style={styles.list_item}>• manage sales and support services;</Text>
                    <Text style={styles.list_item}>• help us track website conversion success metrics;</Text>
                    <Text style={styles.list_item}>• deliver and help us track marketing and advertising content.</Text>
                    <Text style={styles.paragraph}>These third parties have access to your Personal Information only to perform specific tasks on our behalf and are obligated not to disclose or use your information for any other purpose.</Text>
                    <Text style={styles.heading}>Communications</Text>
                    <Text style={styles.paragraph}>We may use your Personal Information to contact you with newsletters, marketing or promotional materials and other information that may be of interest to you.</Text>
                    <Text style={styles.heading}>Compliance with Laws</Text>
                    <Text style={styles.paragraph}>We will disclose your Personal Information where required to do so by law or subpoena or if we believe that such action is necessary to comply with the law and the reasonable requests of law enforcement or to protect the security or integrity of our Services.</Text>
                    <Text style={styles.heading}>Security</Text>
                    <Text style={styles.paragraph}>The security of your Personal Information is important to us, and we strive to implement and maintain reasonable, commercially acceptable security procedures and practices appropriate to the nature of the information we store, in order to protect it from unauthorized access, destruction, use, modification, or disclosure. The connection between user and Services is protected with 128 bit TLS 1.2 encryption (HTTPS protocol). Data is stored using our cloud services and platforms.</Text>
                    <Text style={styles.paragraph}>However, please be aware that no method of transmission over the internet, or method of electronic storage is 100% secure and we are unable to guarantee the absolute security of the Personal Information we have collected from you.</Text>
                    <Text style={styles.paragraph}>If the Personal Information under our control is compromised as a result of a security breach, we will take all reasonable actions to investigate the situation and, where appropriate, to notify those persons whose data may have been affected, and to resolve this issue as much as possible in accordance with any applicable laws and regulations.</Text>
                    <Text style={styles.heading}>International Transfer</Text>
                    <Text style={styles.paragraph}>Your information, including Personal Information, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. </Text>
                    <Text style={styles.paragraph}>If you are located outside the United States and choose to provide information to us, please note that we transfer the information, including Personal Information, to the United States and European Union and process it there.</Text>
                    <Text style={styles.paragraph}>Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</Text>
                    <Text style={styles.heading}>Opting Out from Offers</Text>
                    <Text style={styles.paragraph}>At any time, a user may opt-out from having the user’s Personal Information transferred by Us to third parties for use in such third parties’ direct marketing efforts by sending a request to privacy@cooltool.com. Such opting out may not apply to any communications from third parties to whom we may have already provided Personal Information regarding the user. Additionally, a user may opt-out from receiving future offers by following the opt-out instruction contained within each marketing message. Third parties’ use of the Personal Information is subject to such parties’ own privacy policies, for which we are not responsible.</Text>
                    <Text style={styles.heading}>Wireless Policy</Text>
                    <Text style={styles.paragraph}>Pursuant to the above, we may use Personal Information to provide the services requested by you, including utilizing a provided cell phone number for voice communication with you and services that display customized content and advertising via SMS messages sent to such provided cell phone number. In addition to any fee of which you are notified, your provider’s standard messaging rates apply to our confirmation and all subsequent SMS correspondence. You may opt-out and remove your SMS information by sending “0” to the SMS text message you have received (report spam). </Text>
                    <Text style={styles.paragraph}>All standard messaging charges are billed by and payable to your mobile service provider. We will not be liable for any delays in the receipt of any SMS messages, as delivery is subject to effective transmission from your network operator. SMS message services are provided on an AS IS basis.</Text>
                    <Text style={styles.heading}>Children's Privacy</Text>
                    <Text style={styles.paragraph}>Only persons age 18 or older have permission to access our Services. Our Services do not address anyone under the age of 13 (“Children”). </Text>
                    <Text style={styles.paragraph}>We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you learn that your Children have provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from children under age 13 without verification of parental consent, we take steps to remove that information from our servers.</Text>
                    <Text style={styles.heading}>Your California Privacy Rights</Text>
                    <Text style={styles.paragraph}>California Civil Code Section 1798.83 permits users of Services who are California residents to request certain information regarding CoolTool’s disclosure of Personal Information to third parties for such third parties’ direct marketing purposes. To make such a request, please write to CoolTool Inc. 1390 Market Street, Suite 200, San Francisco, CA 94102.</Text>
                    <Text style={styles.heading}>Changes to this Privacy Policy</Text>
                    <Text style={styles.paragraph}>We reserve the right to revise and update this Privacy Policy at any time. Any such revisions will be effective on the date when published at https://uxreality.com and will apply to all information collected by Us both prior to and following the effective date. Your use of Services following any such revisions will be deemed your acceptance of such revisions. Users should periodically visit this page to review the current policies with regard to Personal Information.</Text>
            </Layout>
        );
  }
}


const styles = EStyleSheet.create({
    // $outline: 1,
    container: {
        flex: 1
    },
    btn: {
        justifyContent: 'column',
        flexWrap: 'wrap',
        height: 'auto',
        width: '48%',
        maxWidth: 150,
        borderWidth: 2,
        // borderColor: '#fff',
        borderRadius: 8,
        justifyContent: "center",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { height: 0, width: 0 },
        elevation:0
    },
    decline: {
        backgroundColor: 'transparent',
        borderColor: '#fff',
    },
    decline_disabled: {
        opacity: .5,
        borderColor: 'rgba(255, 255, 255, .5)',
    },
    accept: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    accept_disabled: {
        backgroundColor: 'rgba(255, 255, 255, .5)',
        borderColor: 'rgba(255, 255, 255, .5)',
    },
    small_text: {
        fontSize: normalizeFont(13),
        color: '#fff'
    },
    heading: {
        fontFamily: 'ProximaBold',
        fontSize: normalizeFont(21),
        marginVertical: 10
    },
    paragraph: {
        marginVertical: 10
    },
    list_item: {
        marginLeft: 10,
        marginVertical: 10
    },
    btnText: {
        fontSize: 20 / PixelRatio.getFontScale()
    }
})

const landscapeStyles = EStyleSheet.create({
  
  })