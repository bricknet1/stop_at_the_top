#!/usr/bin/env python3

from faker import Faker
import random
from config import db, app
from models import User

fake = Faker()

with app.app_context():

    User.query.delete()

    print('Creating Users')
    usernames = ['TophDoggy', 'SAAAAAM', 'Ari_Potter', 'Queen Bee', 'D Bear', 'Liana Din', 'EmileyRulz', 'Wyle', 'Schnyle', 'Stove', 'Twocupterry', 'Trasha']
    users = []
    user1 = User(
        id=1,
        username='bricknet',
        email='test@test.com',
        chips=5000
    )
    user1.password_hash='boat'
    users.append(user1)
    for i in range(12):
        user = User(
            id=(i+2),
            username=usernames[i],
            email=fake.email()
        )
        user.password_hash = '1234'
        users.append(user)

    db.session.add_all(users)
    db.session.commit()
    print('Seeds are planted')