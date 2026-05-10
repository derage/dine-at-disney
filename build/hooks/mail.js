"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mail;
const nodemailer_1 = require("nodemailer");
const to = process.env.EMAIL_TO;
const user = process.env.EMAIL_USERNAME;
const pass = process.env.EMAIL_PASSWORD;
async function mail({ diningAvailability, print, partySize, date, }) {
    if (!user || !pass) {
        print.warning('No email credentials provided');
        return;
    }
    const transporter = (0, nodemailer_1.createTransport)({
        auth: { user, pass },
        service: 'gmail',
    });
    const mailOptions = {
        subject: `Found openings for ${diningAvailability.restaurant.name} on ${date}`,
        to,
        from: user,
        text: JSON.stringify(diningAvailability),
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('✔ email sent');
    }
    catch (err) {
        console.error(err, "✖ couldn't send email");
    }
    finally {
        transporter.close();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob29rcy9tYWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEsdUJBb0NDO0FBNUNELDJDQUE2QztBQUk3QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUNoQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztBQUN4QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztBQUV6QixLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQ2pDLGtCQUFrQixFQUNsQixLQUFLLEVBQ0wsU0FBUyxFQUNULElBQUksR0FNTDtJQUNDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixLQUFLLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDL0MsT0FBTztJQUNULENBQUM7SUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFBLDRCQUFlLEVBQUM7UUFDbEMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtRQUNwQixPQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDLENBQUM7SUFFSCxNQUFNLFdBQVcsR0FBRztRQUNsQixPQUFPLEVBQUUsc0JBQXNCLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sSUFBSSxFQUFFO1FBQzlFLEVBQUU7UUFDRixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO0tBQ3pDLENBQUM7SUFFRixJQUFJLENBQUM7UUFDSCxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUMsQ0FBQztZQUFTLENBQUM7UUFDVCxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdEIsQ0FBQztBQUNILENBQUMifQ==