import React from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material'
import {
  ExpandMore,
  Gavel,
  Security,
  Restaurant,
  Home,
  Warning,
  Info,
  CheckCircle
} from '@mui/icons-material'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function Rules(){
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const furnitureCosts = [
    { sno: 1, item: 'Light Fitting', amount: 500 },
    { sno: 2, item: 'Steel/Plastic Chair', amount: 1000 },
    { sno: 3, item: 'Book Rack', amount: 2500 },
    { sno: 4, item: 'Fan', amount: 1600 },
    { sno: 5, item: 'Cot', amount: 3500 },
    { sno: 6, item: 'Table', amount: 2500 }
  ]

  const messTimings = [
    { meal: 'Breakfast', workingDays: '7.00 a.m. - 8.45 a.m.', holidays: '7.30 a.m. - 9.30 a.m.' },
    { meal: 'Lunch', workingDays: '12.00 Noon - 1.30 p.m.', holidays: '12.30 p.m. - 2.00 p.m.' },
    { meal: 'Dinner', workingDays: '6.30 p.m. - 8.30 p.m. (Girls Mess)\n6.45 p.m. - 8.45 p.m. (Other Messes)', holidays: 'Same as Working Days' }
  ]

  return (
    <>
      <PublicTopNav />

      {/* Header Section */}
      <Box sx={{
        py: 6,
        background: isDark
          ? 'linear-gradient(135deg, #0f0d1a 0%, #161326 50%, #1a1533 100%)'
          : 'linear-gradient(135deg, #f7f6ff 0%, #efe6ff 50%, #e8e0ff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#1a1a1a',
                mb: 2,
                letterSpacing: '-0.5px'
              }}
            >
              ENGINEERING COLLEGE HOSTELS
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                fontWeight: 500,
                mb: 2
              }}
            >
              COLLEGE OF ENGINEERING GUINDY, ANNA UNIVERSITY, CHENNAI - 600025
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                mb: 3
              }}
            >
              RULES AND REGULATIONS (With effect from 2025 - 2026)
            </Typography>
            <Chip
              icon={<Gavel />}
              label="Hostel Regulations"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* GENERAL Section */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Info sx={{ mr: 1, color: theme.palette.primary.main }} />
              GENERAL
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Engineering College Hostels provides residential accommodation for about 4500 students with boarding facilities.
                Separate accommodation is provided for boys and girls.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Dean, College of Engineering, Guindy Campus is the Warden of the Hostels. The Warden is assisted by the Executive Warden, Deputy Wardens and Resident Counselors for the efficient management and supervision of the hostels.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The hostel rules and regulations framed by the Warden / Executive Warden are modified from time to time, shall apply to all the hostel residents.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Resident Counselors of a Block shall stand in as "loco parentis" to all students in that block.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Warden / Executive Warden reserve the power to interpret and enforce the rules and regulations with respect to hostel admissions/ readmissions.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Students are expected to uphold high standards of behavior befitting a prestigious institution.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents must show respect toward fellow students, hostel staff, and visitors.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Actions that may cause harm, discomfort, or distress to others must be strictly avoided.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Respect for the privacy and personal space of others is essential.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents must maintain cleanliness and hygiene in both personal rooms and common areas.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Garbage must be disposed of properly, and recycling guidelines should be followed.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Any maintenance issues should be reported promptly to the concerned authorities.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Common areas must not be blocked or used for personal storage.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Eat well & eat sumptuously but make sure that food is not wasted. Food wastage must be avoided under all circumstances.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Water is an essential and scarce commodity, wastage of water must be avoided.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, fontWeight: 600, color: theme.palette.error.main }}>
                Unauthorized recording and making videos / Reels is prohibited.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* ADMISSION Section */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 1, color: theme.palette.primary.main }} />
              ADMISSION
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Admission to the hostels shall be made through online portal only.
              </Typography>
              <Paper sx={{
                p: 2,
                mb: 2,
                backgroundColor: theme.palette.warning.light,
                border: `1px solid ${theme.palette.warning.main}`
              }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.warning.dark }}>
                  Important Note: During the online process, there may be failures due to technical issues. In case of such failures the inconvenience caused is regrettable. Kindly get in touch with the Hostel office at:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.warning.dark }}>
                  044 – 22352257 / 22359053
                </Typography>
              </Paper>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Admission to the hostels cannot be assumed to be done by way of any right. The accommodation provided to students in the hostels is to help them to pursue their education in a homely atmosphere and to facilitate the student to spend more time towards study.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Every student before he/she is admitted into the hostel must give an undertaking in writing that he/she will abide by the rules of the hostel and he/she will submit to any disciplinary action imposed on him/her by the authorities.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Discontinuation after admission to the hostel, will not be permitted
              </Typography>
              <Box sx={{ pl: 4, mb: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  • Without the written application from his/ her parents and
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  • Without the approval of the Executive Warden/Deputy Warden (Blocks) in writing or email.
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residentship ceases at the end of each academic year and all the students must return their Hostel identity card, failing which their request for the hostel readmission in the next year will not be entertained. In addition, the cost of furniture and fitting in case of any damage or loss will also be recovered. The residents who are desirous of returning to the hostel shall make a formal application for readmission before the start of the next academic year.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residence cannot confer any right to residentship in the hostel for the next year or for any subsequent period.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Students desirous of having hostel accommodation during the summer/winter vacation shall submit their applications to the hostel office well in advance. They will be allotted rooms in one of the hostel blocks specified for summer vacation. They shall pay hostel stay extension charges at the prescribed rates. Vacation mess facility will also be provided if sufficient number of residents opt for it on prescribed rates.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, fontWeight: 600 }}>
                The Warden/Executive Warden has the right to refuse admission re-admission to anyone without assigning any reason.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* LODGING Section */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Home sx={{ mr: 1, color: theme.palette.primary.main }} />
              LODGING
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Selection of rooms can be done online based on availability & based on the blocks assigned.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                No room shall be occupied by a resident without payment of the hostel fees and mess advance.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                No resident shall be admitted to the hostel mess for boarding without the production of the hostel fee receipt.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Students must occupy the rooms allotted to them and should not change / exchange rooms without prior permission from the Executive Warden. Violation of this rule will result in the expulsion of the concerned students from the hostel.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Resident may be shifted from one room to another without assigning any reason by the Resident Counsellor in consultation with Executive Warden.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Hostel furniture shall not be removed from one room to another under any circumstance. Residents of the respective rooms are responsible for the furniture and fittings in their rooms. The cost of furniture and fittings (as in Annexure - I) will be recovered from them in case of damage or loss along with a fine of Rs.1000/-
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents are not allowed to install extra electrical fittings in their rooms, unless permitted by the Executive Warden. Unauthorized tapping of electrical power will be dealt with severely. However, table fans, computers, etc., can be used by a resident with permission from the Executive Warden by paying extra charges. No stereos and televisions are permitted. If any misuse of computers in the hostel rooms is brought to the notice of the Hostel authorities, the respective resident(s) will be expelled from the hostel.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Room Maintenance & Conduct */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1, color: theme.palette.primary.main }} />
              ROOM MAINTENANCE & CONDUCT
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                All the rooms, walls, doors and windows should be kept tidy and clean. A fine of Rs.2000/- will be levied for disfiguring of doors, windows, glass panels, furniture and walls of rooms from the resident(S) of the room. In addition, the amount required to repair the above will also be collected from the concerned residents.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                A collective fine of Rs.3000/- Will be collected from the residents of the respective wing/floor for disfiguring veranda, bathroom and other common facilities in addition to the amount needed for repairing the above.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                A collective fine of Rs.5000/- will be collected from the residents of the respective block for disfiguring the common rooms and damaging the property in the hostel blocks, in addition to the replacement cost.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents are instructed to switch off the lights and fans whenever they go out of the rooms to save electric power. A fine of Rs.250/- will be collected from the resident(s) of the rooms, who violate(s) the instruction.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The above said activities of the residents will be subjected to severe disciplinary action also. The above said Violations will be personally inspected by the Executive Warden and he reserves the right to levy fine if any such damage is done.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents are instructed to switch off the lights in their rooms between 10.30. p.m. and 5.30 a.m., if any of the occupants is not comfortable with lights switched on during sleeping. In such situations, the other occupants of the room, if required shall make use of the common rooms for studying.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Taps, showers, and cisterns must be closed properly after use.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Rooms must be locked securely when unoccupied.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Unauthorized individuals are not permitted inside the hostel premises.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Any security concerns should be immediately reported to hostel authorities.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Quiet hours are to be observed from 10:00 PM to 6:00 AM.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Noise levels should be kept to a minimum during quiet hours.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Music, conversations, or any other sounds should not be audible outside the room.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The residents are advised to lock their rooms whenever they move out of the hostel rooms for attending class and other activities. The room should not be left unlocked under any circumstances. Each occupant of the room must have a key for his/her respective room. The keys should not be left on the window or similar locations.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Students using bicycle are solely responsible for their bicycles. Students MUST submit the form and register their bicycles with the hostel office. It is advised to keep the bicycles with proper lock & key. Students are not allowed to use any type of motorized / powered vehicles, two wheelers, bikes, scooters, cars within the campus.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                It is the responsibility of all occupants to ensure that the hostel room is bolted from inside while sleeping.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The residents are not permitted to stay away from the hostel beyond 9.30 p.m. (for Boys) & beyond 8.30 p.m. (for Girls) without obtaining prior permission from the Executive Warden. Resident Counsellors are permitted to follow varied time limits to allow the residents of their respective blocks in Consultation with Executive Warden.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                No residents shall absent himself / herself from the hostel without obtaining prior permission. If a member wishes to leave the hostel on a personal matter, he/she shall report before his/her departure the reasons for his/her absence in writing to the Resident Counsellor and by entering the details in the migration register kept in the respective Hostel Block. Permission from parents by email or WhatsApp shall be mandatory in such cases and the same has to be produced on demand by the authorities.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, fontWeight: 600, color: theme.palette.error.main }}>
                Visitor Policy: Guests/Visitors are NOT permitted to enter any room allotted to the residents of the hostel.Any resident who violates / helps to violate the rule under 3.9 will be levied a fine of Rs.1000/- and will be evicted from the Hostel by the Hostel authorities.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The residents are requested to ensure the safety of their belongings in their rooms. They are advised not to keep cash and valuables in their rooms, such as costly mobiles and other electronic gadgets. No complaints will be entertained.The CEG Hostels recommend that the residents must lock their rooms while leaving the hostels and the residents should be more careful and cautious while storing their money and valuables, since such items should be stored under proper lock and key.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* BOARDING Section */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Restaurant sx={{ mr: 1, color: theme.palette.primary.main }} />
              BOARDING
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The details of Boarding and Lodging charges for the students admitted into various hostels of Anna University are available at the Hostel office. The details will also be made available at the time of admission into the various courses.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                MESS CHARGES
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Mess charges will be due from the date of joining the Mess.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Mess charges per month shall be based on the dividing system and it will be displayed on the notice Board / communicated through electronic media.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                REDUCTION OF MESS CHARGES
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Whenever a resident stays away from the hostel for period exceeding five days, reduction of mess charges will be given only for the number of days in excess of two days provided, an application for reduction is made in the prescribed form, 48 hours in advance. Mess reduction during working days will not be given for ordinary leave letters. However, reduction can be claimed for the absence on medical grounds/extraordinary situation.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The maximum duration of the period for mess reduction shall not exceed 10 days unless it is on medical grounds or other extraordinary situation. The permission from the Executive Warden must be obtained if the period exceeds 10 days.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Only one mess reduction per month will be permitted for each resident.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The total reduction period should not exceed 30 days per semester. However, one more reduction period in any of the months not exceeding five days will be allowed by the Executive Warden for special cases per semester on application.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                For cancellation of reduction in mess charges, written intimation has to be given in prescribed form one day in advance, counter signed by the Resident Counsellor. Forms for reduction and cancellation will be available with the Mess Supervisor in the Hostel Office.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The residents are permitted to stay away for the Hostel continuously for project work for a period not exceeding 60 days in a year, with proper written permission for the Project Guide and counter signed by the respective HOD with approval from the Executive Warden. During their absence, Rs.20/- per day will be charged as mess administrative charges. Extension beyond 60 days will not be granted.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The residents who wish to travel for their Project Work exceeding 60 days have to vacate the hostel with the proper approval of the Executive Warden. Priority for readmission will be considered according to the availability of the rooms, for such residents.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                If any residents dines in the mess when he/she has applied for reduction, the reduction gets cancelled for the whole semester and a fine of Rs.1000/- will be collected from the member in addition to the guest charges of Rs.150/- for the days he/she dined. If the act is repeated, the concerned resident will be expelled from the hostel.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                No Guest are permitted to dine in the mess. Residents found entertaining guests will be fined for Rs.1000/- and may be expelled from the hostel.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                In the absence of the written application for reduction or to take food in the mass due to any other reasons, the Residents are marked present whether they proceed on official tour / holidays. Similarly, in the absence of any written application for extension of reduction in advance, the residents will be marked present after authorized reduction period is over. It is therefore very important to note that applications for reduction or extension of reduction or cancellation of reduction are submitted to the Hostel office as per rules, in order to avoid billing for the days when the facility was not used. If application for reduction or extension of reduction is made through post / registered post with acknowledgement, the residents should retain the proof for intimation. The resident has to submit the Reduction Form in the prescribed format immediately after arrival.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                MESS TIMINGS
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The following will be the mess timings.
              </Typography>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Meal</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Working Days</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Holidays</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {messTimings.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>{row.meal}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-line' }}>{row.workingDays}</TableCell>
                        <TableCell>{row.holidays}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Residents shall adhere to the above given timing strictly. Supply of food cannot be assured after the prescribed time, and no deduction can be claimed from the same.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Dining is strictly prohibited outside the Dining Halls. Any food / drinks should not be taken to rooms or to any other place outside the Dining Halls. If any of the Resident takes food / drinks outside the Dining Hall, a fine of Rs.250/- will be levied.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Rules 4.4.2 will not be applicable to members who fall sick and are unable to take the meals in the Dining Halls. All such cases requiring room service should be authorized by the Executive Warden / Resident Counsellor. Such Residents names will be displayed on the Mess Notice Board.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Outside food is not allowed inside the Dining Halls / Hostel Rooms.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                CHANGE OF MESS
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Change from one mess to another can be allowed only at the beginning of the semester submitting a written application to the Executive Warden whose decision shall be final and binding. Temporary change of mess shall be permitted at the discretion of the Executive Warden, but the mess bill will be generated from the original mess attached.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                VACATION PERIOD - MESS & ACCOMMODATION
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Vacation Period Definition: Starts 2 days after last regular exam and ends one day before the re-opening of the Institution.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Internal students staying for curriculum based internship/industrial training/project work/Viva voce shall be allowed based on submission of valid supporting documents and approval from the competent authorities. (only dining charges @Rs.150/- per day applicable).
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Internal students staying for activities related to academics shall be allowed based on submission of valid supporting documents and approval from the competent authorities. (Rs.150/- towards stay per day and Rs.150/- towards dining per day).
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                External candidates staying for activities related to academics shall be allowed based on submission of valid supporting documents and approval from the competent authorities. (Rs.150/- towards stay per day and Rs.150/- towards dining per day).
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* MANAGEMENT OF THE HOSTEL */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Security sx={{ mr: 1, color: theme.palette.primary.main }} />
              MANAGEMENT OF THE HOSTEL
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Apart from the authorities for management of the Hostel, Student Representatives will be elected to help in the smooth functioning of the Hostel.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                BLOCK SECRETARY
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The residents of each Block shall elect one Block Representative among themselves.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Block Representative of the Blocks shall help the Resident Counsellor in the organization and administration of the Common Rooms and other facilities of their Block.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                MESS SECRETARY
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                One Student representative from each year will be selected and he/she will act as the Mess Secretary.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Mess Representative shall help the Executive Warden in the administration and smooth running of the Messes.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                THE HOSTEL COMMITTEE
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Hostel Committee shall consist of the Warden, Executive Warden, Deputy Wardens, Residential Counsellors and the other elected Student Secretaries. The Dean of CEG will be the Chairman of Hostel Committee. In the absence of the Dean, Executive Warden will conduct the proceedings.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                ELECTORATE AND ELECTIONS
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                All students of the college who have paid one year room rent and who are residents of the Hostel shall be eligible to vote in the election of Representatives. One who is not a student on the rolls of the College or who has not paid the room rent for that academic year shall not be eligible to vote.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The voting shall be by secret ballot.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The elections will be held within one month of re-opening of the Hostel for the academic year.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Executive Warden will arrange for the elections with the assistance of the Hostel Officials and his decisions shall be final in all matters regarding the elections.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The Executive Warden shall nominate Block/Mess Secretaries from the residents if nominations are not received/vacancy arises during the period of the semester.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* DISCIPLINE */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1, color: theme.palette.primary.main }} />
              DISCIPLINE
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents shall not issue orders to hostel employees or interfere in their work. Misconduct of Hostel employees shall be reported to the Executive Warden with full particulars.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents shall not to tip any of the employees of the hostel.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents are not allowed to put up notices or convene meetings or take out procession of any sort within the Hostel area.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Residents are instructed to maintain silence and not create sort of disturbance such as playing music, creating noise etc. between 9.00 p.m. and 6.00 a.m.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, fontWeight: 600, color: theme.palette.error.main }}>
                Consumption and / or possession of liquor or drugs within the Hostel and University campus are strictly prohibited. Any resident entering the hostel after the consuming of liquor or drinks or drugs outside the campus is also prohibited. Any resident violating this rule will be expelled from the hostel.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, fontWeight: 600, color: theme.palette.error.main }}>
                Any violent activity within the Hostel and University campus will result in expulsion of the resident concerned from the hostel and from the College.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The residents are advised to carry with them the Identity Cards issued by the University and Hostel, Whenever they go out of the Hostel Rooms or University campus.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Utmost decorum and decency must be maintained in the University Campus when boys and girls students interacting with each other.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Unauthorized screening of any film or video or CD anywhere within the Hostel premises is totally forbidden.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Use of Powered Vehicle is strictly prohibited except in case of physically challenged students.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Hostel facility is extended to an outstation student to pursue the study in a comfortable atmosphere. Therefore, any resident staying in room during the working hours of the College without valid reasons will be expelled from the hostel.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                The above rules and regulations are not exhaustive. The hostel authorities are empowered to bring in any new rules and regulations without any notice as and when a situation warrants it.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                All the residents of the Hostels are expected to know and be aware all the rules and regulations pertaining to the Hostel. Pleading ignorance of rules and regulations at any stage will not be accepted.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Misconduct or breach of any of the rules of the Hostel renders the offender liable to be denied permission to stay in the hostel.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Gambling, betting, or involvement in multi-level marketing schemes is not allowed.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Cooking is not permitted inside hostel rooms.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Instances of misconduct will be subject to inquiry by competent authorities.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* SPECIAL ATTENTION: MODE OF PAYMENT/REFUND */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Info sx={{ mr: 1, color: theme.palette.primary.main }} />
              SPECIAL ATTENTION: MODE OF PAYMENT/REFUND
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                If any Hostel Resident wishes to discontinue from the hostel, he/she shall get the signature of the Resident Counsellor in the application and submit it at the Hostel office and enter the same in the register failing which he/she will be marked present in the Mess Register. Permission from parents by email or WhatsApp shall be mandatory in such cases and the same has to be produced on demand by the authorities.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Any Hostel Resident who is vacating the Hostel without completing the Hostel vacating procedure as specified by the Hostel office, has to pay a fine of Rs. 500/- (Rupees Five Hundred only) and Rs. 50/- per day as levy charges from his/her eligible vacation date to the date of completing vacating procedure.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* REPRESENTATION / COMPLAINTS */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Gavel sx={{ mr: 1, color: theme.palette.primary.main }} />
              REPRESENTATION / COMPLAINTS
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Any letter of representation/complaint regarding the Hostel shall be addressed to the Executive Warden and given only to the Executive Warden in the Hostel office.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                If any representation/Complaint is related to the Block, it shall be routed through the Resident Counselor to the Executive Warden.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                For any clarification/counseling, the residents are welcome to meet the Hostel Officials at any time.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Any grievances may also be sent via email to the address, grievancesceghostel@yahoo.com.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* RAGGING */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1, color: theme.palette.error.main }} />
              RAGGING
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Paper sx={{
                p: 2,
                mb: 2,
                backgroundColor: theme.palette.error.light,
                border: `1px solid ${theme.palette.error.main}`
              }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.error.dark }}>
                  Legal Notice: Anna University is guided by the Tamil Nadu Prohibition of Ragging Act 1997, according to which any student who commits ragging shall be punished with imprisonment for a term which may be extended to two years and shall be liable to a fine which may be extended to ten thousand rupees. Further, the convicted student shall be dismissed for the Institution and shall not be admitted in any other Institution.
                </Typography>
              </Paper>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Ragging is strictly prohibited. Anybody found indulging in such activities should reported to the Hostel authorities immediately or the information can be written and dropped into the complaint box, kept for the purpose.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Ragging in any form (making unpleasant noise, disorderly conduct, doing any act which causes or likely to cause physical or psychological harm or raise apprehension or fear of shame or embarrassment to the Freshers, which includes teasing, abusing, playing practical jokes on or causing hurt to such students or in the ordinary course willingly do) is strictly forbidden. If anyone is found guilty of ragging he/she will be expelled and is also liable for prosecution under the Tamilnadu Prohibition of Ragging Act 1997 which will result in a minimum punishment with imprisonment for a term which my extend to two years and shall also be liable to pay a fine of Rs.10,000/-.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Acts such as physical assault and abuse, mental harassment, forced stripping, or obscene behaviour are forbidden.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Forcing juniors to address seniors as "Sir," perform mass drills, or run errands is considered ragging and is strictly prohibited.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* OTHER PROVISIONS */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Info sx={{ mr: 1, color: theme.palette.primary.main }} />
              OTHER PROVISIONS
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Activities that disrupt peace or order within the hostel are not permitted.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Students must cooperate with maintenance work and vacate rooms when instructed.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Pasting posters, graffiti, or defacing hostel walls and property is strictly prohibited.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Authorities may conduct spot checks without prior notice.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                Hostel transfers may be initiated when required, ensuring similar facilities.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* ANNEXURE-I */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
            <Gavel sx={{ mr: 1, color: theme.palette.primary.main }} />
            ANNEXURE-I
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Furniture/Fitting Replacement Costs
          </Typography>

          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>S.No.</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Name of the furniture/fitting</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Amount (Rs.)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {furnitureCosts.map((item) => (
                  <TableRow key={item.sno}>
                    <TableCell sx={{ fontWeight: 600 }}>{item.sno}</TableCell>
                    <TableCell>{item.item}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Footer />
    </>
  )
}
