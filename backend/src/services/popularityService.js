export const calculatePopularity = (user, friendDocument = []) => {
    const uniqueFriends = user.friends.length;

    let sharedHobbies = 0;

    friendDocument.forEach(friend => {
        friend.hobbies.forEach(hobby => {
            if (user.hobbies.includes(hobby)) {
                sharedHobbies++;
            }
        })
    })

    return uniqueFriends + sharedHobbies * 0.5
}